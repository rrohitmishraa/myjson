const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
const cache = {};

/* ---------- HELPERS ---------- */

function parseGoogleJSON(text) {
  try {
    const json = text.substring(47).slice(0, -2);
    return JSON.parse(json);
  } catch (err) {
    throw new Error("Invalid Google response format");
  }
}

function convertToJSON(data) {
  if (!data.table || !data.table.rows) {
    throw new Error("Invalid sheet structure");
  }

  const rows = data.table.rows;

  // Try labels first
  let cols = data.table.cols.map((col, i) =>
    col.label ? col.label.toLowerCase().replace(/\s+/g, "_") : null,
  );

  // If labels are missing → use first row as header
  if (cols.some((c) => !c)) {
    cols = rows[0].c.map((cell, i) =>
      cell && cell.v
        ? cell.v.toString().toLowerCase().replace(/\s+/g, "_")
        : `column_${i}`,
    );

    // Remove header row from data
    rows.shift();
  }

  return rows.map((row) => {
    let obj = {};
    row.c.forEach((cell, i) => {
      obj[cols[i]] = cell ? cell.v : null;
    });
    return obj;
  });
}

/* ---------- ROUTES ---------- */

// Root test route
app.get("/", (req, res) => {
  res.send("Backend is alive 🚀");
});

// Main API
app.get("/api/:sheetId/:sheetName", async (req, res) => {
  const { sheetId, sheetName } = req.params;

  const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

  const cacheKey = req.originalUrl;
  if (cache[cacheKey]) {
    return res.json(cache[cacheKey]);
  }

  try {
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch sheet");
    }

    const text = await response.text();
    const parsed = parseGoogleJSON(text);
    let result = convertToJSON(parsed);

    let filtered = result;

    // Filtering (contains match)
    Object.entries(req.query).forEach(([key, value]) => {
      if (["sort", "limit", "fields", "page"].includes(key)) return;

      filtered = filtered.filter((item) => {
        if (!item[key]) return false;
        return item[key].toString().toLowerCase().includes(value.toLowerCase());
      });
    });

    // Sorting
    if (req.query.sort) {
      const key = req.query.sort;
      filtered.sort((a, b) => {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
      });
    }

    // Field selection
    if (req.query.fields) {
      const fields = req.query.fields.split(",");
      filtered = filtered.map((item) => {
        let obj = {};
        fields.forEach((f) => {
          obj[f] = item[f];
        });
        return obj;
      });
    }

    // Pagination
    const limit = parseInt(req.query.limit) || filtered.length;
    const page = parseInt(req.query.page) || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    const responseData = {
      success: true,
      total: result.length,
      filtered: filtered.length,
      page,
      limit,
      data: paginated,
    };

    cache[cacheKey] = responseData;
    setTimeout(() => delete cache[cacheKey], 60000);

    res.json(responseData);
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ---------- START ---------- */

const PORT = 5555;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
