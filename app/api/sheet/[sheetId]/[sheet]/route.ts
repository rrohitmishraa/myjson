export async function GET(
  req: Request,
  context: { params: Promise<{ sheetId: string; sheet: string }> },
) {
  const { sheetId, sheet } = await context.params;

  const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheet}`;

  try {
    const res = await fetch(fetchUrl, {
      // prevents caching weird responses
      cache: "no-store",
    });

    const text = await res.text();

    // 🔥 ULTRA ROBUST PARSING (handles all edge cases)
    let jsonString = "";

    // Strategy 1: setResponse wrapper
    const match = text.match(/setResponse\((.*)\)/s);
    if (match && match[1]) {
      jsonString = match[1];
    }

    // Strategy 2: fallback to first valid JSON block
    if (!jsonString) {
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = text.substring(firstBrace, lastBrace + 1);
      }
    }

    // Final validation
    if (!jsonString) {
      console.error("RAW GOOGLE RESPONSE:\n", text);
      throw new Error("Invalid Google Sheets response");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error("FAILED PARSE STRING:\n", jsonString);
      throw new Error("Failed to parse Google Sheets JSON");
    }

    // Handle empty sheet safely
    if (!parsed.table || !parsed.table.rows) {
      return Response.json({
        success: true,
        rows: 0,
        data: [],
      });
    }

    const cols = parsed.table.cols.map((col: any, i: number) =>
      col.label ? col.label.toLowerCase().replace(/\s+/g, "_") : `column_${i}`,
    );

    const result = parsed.table.rows.map((row: any) => {
      let obj: any = {};

      row.c.forEach((cell: any, i: number) => {
        obj[cols[i]] = cell ? cell.v : null;
      });

      return obj;
    });

    return Response.json({
      success: true,
      rows: result.length,
      data: result,
    });
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message || "Something went wrong",
      },
      { status: 500 },
    );
  }
}
