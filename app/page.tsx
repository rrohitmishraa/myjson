"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [sheet, setSheet] = useState("Sheet1");
  const [apiUrl, setApiUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  function extractSheetId(url) {
    const match = url.match(/\/d\/(.*?)\//);
    return match ? match[1] : null;
  }

  const handleGenerate = async () => {
    const sheetId = extractSheetId(url);
    if (!sheetId) {
      alert("Invalid Google Sheet URL");
      return;
    }

    const endpoint = `http://localhost:5555/api/${sheetId}/${sheet}`;
    setApiUrl(endpoint);

    setLoading(true);

    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiUrl);
    alert("Copied!");
  };

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "auto" }}>
      <h1>Google Sheets → API</h1>

      <input
        placeholder="Paste Google Sheet URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
      />

      <input
        placeholder="Sheet Name"
        value={sheet}
        onChange={(e) => setSheet(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 10 }}
      />

      <button onClick={handleGenerate} style={{ padding: 10 }}>
        Generate API
      </button>

      {apiUrl && (
        <div style={{ marginTop: 20 }}>
          <p><b>API URL:</b></p>
          <code>{apiUrl}</code>
          <br />
          <button onClick={copyToClipboard}>Copy</button>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {data && (
        <pre
          style={{
            marginTop: 20,
            background: "#111",
            color: "#0f0",
            padding: 20,
            overflow: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}