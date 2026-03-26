export async function GET(
  req: Request,
  context: { params: Promise<{ sheetId: string; sheet: string }> },
) {
  const { sheetId, sheet } = await context.params;

  const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheet}`;

  try {
    const res = await fetch(fetchUrl, {
      cache: "no-store",
    });

    const text = await res.text();

    // 🔥 Parse Google weird response
    let jsonString = "";

    const match = text.match(/setResponse\(([\s\S]*)\)/);
    if (match && match[1]) {
      jsonString = match[1];
    }

    if (!jsonString) {
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
      return Response.json({
        success: true,
        rows: 0,
        data: [],
      });
    }

    // ✅ ONLY VALID HEADERS (no column_11 nonsense)
    const cols = parsed.table.cols.map((col: any) =>
      col.label ? col.label.toLowerCase().replace(/\s+/g, "_") : null,
    );

    const result = parsed.table.rows.map((row: any) => {
      let raw: any = {};

      // build raw object
      row.c.forEach((cell: any, i: number) => {
        if (!cols[i]) return;
        raw[cols[i]] = cell ? cell.v : "";
      });

      // 🔥 STRICT OUTPUT FORMAT (your required structure)
      const obj: any = {
        id: raw.id ? String(raw.id) : "",
        name: raw.name || "",
        price:
          raw.price !== undefined && raw.price !== null
            ? String(raw.price)
            : "",
        category: raw.category || "",
        tags: raw.tags || "",
        image: raw.image || "",
        spiceLevel:
          raw.spicelevel !== undefined && raw.spicelevel !== null
            ? String(raw.spicelevel)
            : "",
        pieces: raw.pieces || "",
        available: raw.available ? "TRUE" : "FALSE",
      };

      // optional fields
      if (raw.popular) obj.popular = "TRUE";
      if (raw.description) obj.description = raw.description;

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
