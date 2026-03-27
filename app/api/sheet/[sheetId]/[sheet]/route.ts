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

  const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&tq=select%20*&headers=1&sheet=${sheet}`;

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

    // ✅ Use Google-provided headers (fixed with headers=1)
    let cols = parsed.table.cols.map((col: any) =>
      col.label && col.label.trim() !== ""
        ? col.label.toLowerCase().replace(/\s+/g, "_")
        : null,
    );

    // 🔥 trim trailing empty columns
    let lastIndex = cols.length - 1;
    while (lastIndex >= 0 && !cols[lastIndex]) lastIndex--;
    cols = cols.slice(0, lastIndex + 1);

    const dataRows = parsed.table.rows;

    // ✅ Build consistent objects (no fake columns, but keep structure intact)
    const result = dataRows
      .map((row: any) => {
        const obj: any = {};

        for (let i = 0; i < cols.length; i++) {
          const key = cols[i];
          if (!key) continue;

          const cell = row.c[i];
          const value = cell?.v ?? cell?.f ?? "";

          obj[key] = value ?? "";
        }

        return obj;
      })
      // 🔥 remove completely empty rows
      .filter((obj: any) =>
        Object.values(obj).some((v) => v !== "" && v !== null),
      );

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
