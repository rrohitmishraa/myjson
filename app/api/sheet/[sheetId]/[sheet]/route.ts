export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ sheetId: string; sheet: string }> },
) {
  const headers = corsHeaders();

  const { sheetId, sheet } = await context.params;

  const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheet}`;

  try {
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    const text = await res.text();

    // 🔥 Extract JSON from Google response
    let jsonString = "";
    const match = text.match(/setResponse\(([\s\S]*)\)/);

    if (match && match[1]) {
      jsonString = match[1];
    } else {
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = text.substring(firstBrace, lastBrace + 1);
      }
    }

    if (!jsonString) {
      console.error("RAW GOOGLE RESPONSE:\n", text);
      throw new Error("Invalid Google Sheets response");
    }

    const parsed = JSON.parse(jsonString);

    if (!parsed.table || !parsed.table.rows) {
      return Response.json(
        {
          success: true,
          rows: 0,
          data: [],
        },
        { headers },
      );
    }

    // ✅ Get headers (with fallback to first row if Google fails)
    let cols = parsed.table.cols.map((col: any) =>
      col.label && col.label.trim() !== ""
        ? col.label.toLowerCase().replace(/\s+/g, "_")
        : null,
    );

    // 🔥 Fallback: use first row as header if all labels are missing
    if (cols.every((c: any) => !c)) {
      const firstRow = parsed.table.rows[0];

      if (firstRow) {
        cols = firstRow.c.map((cell: any, i: number) =>
          cell?.v
            ? String(cell.v).toLowerCase().replace(/\s+/g, "_")
            : `column_${i}`,
        );

        // remove header row from data
        parsed.table.rows.shift();
      }
    }

    // ✅ Build consistent objects (no fake columns, but keep structure intact)
    const result = parsed.table.rows.map((row: any) => {
      const obj: any = {};

      row.c.forEach((cell: any, i: number) => {
        const key = cols[i];
        if (!key) return; // skip columns with no header

        const value = cell ? cell.v : "";

        // ✅ Always keep key for consistent API structure
        obj[key] = value ?? "";
      });

      return obj;
    });

    return Response.json(
      {
        success: true,
        rows: result.length,
        data: result,
      },
      { headers },
    );
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message || "Something went wrong",
      },
      { status: 500, headers },
    );
  }
}

// 🔥 Reusable CORS
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
