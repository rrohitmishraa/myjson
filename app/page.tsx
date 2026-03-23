"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [url, setUrl] = useState("");
  const [sheet, setSheet] = useState("Sheet1");
  const [apiUrl, setApiUrl] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  function extractSheetId(url: string): string | null {
    const match = url.match(/\/d\/(.*?)\//);
    return match ? match[1] : null;
  }

  const handleGenerate = async () => {
    const sheetId = extractSheetId(url);
    if (!sheetId) return alert("Invalid URL");

    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5555";

    const endpoint = `${base}/api/${sheetId}/${sheet}`;
    setApiUrl(endpoint);

    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      setData(json);
    } catch (err) {
      alert("Error fetching data");
    }
    setLoading(false);
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${isDark
        ? "bg-gradient-to-br from-[#050505] via-[#0f0f0f] to-black text-white"
        : "bg-gradient-to-br from-[#f8fafc] via-[#eef2f7] to-[#e2e8f0] text-gray-900"
        }`}
    >
      <div className="absolute w-150 h-150 bg-purple-600/20 blur-[120px] rounded-full -top-25 -left-25" />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-6 right-6 px-4 py-2 rounded-lg backdrop-blur-lg border border-white/10 bg-white/10 hover:scale-105 transition cursor-pointer"
      >
        {isDark ? "☀️ Light" : "🌙 Dark"}
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl space-y-6"
      >
        {/* LEFT SIDE - INPUT PANEL */}
        <div className={`p-6 rounded-2xl border shadow-lg transition-all ${isDark
          ? "bg-[#0f0f0f] border-white/10"
          : "bg-white/90 border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-md"
          }`}>
          <h2 className="text-xl font-semibold mb-4">Setup API</h2>

          <div className="space-y-4">
            <input
              placeholder="Paste Google Sheet URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full p-3 rounded-lg ${isDark
                ? "bg-black/20 border border-white/10"
                : "bg-white border border-gray-300 focus:ring-purple-500"
                } focus:outline-none focus:ring-2 transition placeholder:text-gray-400`}
            />

            <input
              placeholder="Sheet Name"
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              className={`w-full p-3 rounded-lg ${isDark
                ? "bg-black/20 border border-white/10"
                : "bg-white border border-gray-300 focus:ring-purple-500"
                } focus:outline-none focus:ring-2 transition placeholder:text-gray-400`}
            />

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleGenerate}
              className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition shadow-md hover:shadow-purple-500/20 cursor-pointer"
            >
              Generate API
            </motion.button>

            {apiUrl && (
              <div className={`mt-4 p-3 rounded-lg ${isDark
                ? "bg-black/30 border border-white/10"
                : "bg-gray-50 border border-gray-200"
                }`}>
                <p className="text-xs opacity-60 mb-2">Endpoint</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-purple-400 text-xs break-all">
                    {apiUrl}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiUrl)}
                    className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESPONSE BELOW */}
        {(loading || data) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border shadow-lg transition-all ${isDark
              ? "bg-[#0a0a0a] border-white/10"
              : "bg-white/95 border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-md"
              }`}
          >
            <h2 className="text-xl font-semibold mb-4">Response</h2>

            {loading && (
              <div className="flex items-center justify-center h-75 opacity-70">
                Fetching data…
              </div>
            )}

            {data && (
              <div className={`h-105 overflow-auto rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-black/40" : "bg-gray-50"} p-3`}>
                <pre
                  className={`text-xs whitespace-pre-wrap ${isDark ? "text-green-400" : "text-gray-800"
                    }`}
                >
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}