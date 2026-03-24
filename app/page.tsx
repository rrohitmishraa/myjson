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
  const [copied, setCopied] = useState<string | null>(null);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  function extractSheetId(url: string): string | null {
    const match = url.match(/\/d\/(.*?)\//);
    return match ? match[1] : null;
  }

  const handleGenerate = async () => {
    const sheetId = extractSheetId(url);
    if (!sheetId) return alert("Invalid URL");

    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5555";
    const endpoint = `${base}/api/${sheetId}/${sheet}`;

    // Debug API endpoint
    console.log("API Endpoint:", endpoint);

    setApiUrl(endpoint);
    setLoading(true);

    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      alert("Error fetching data. Check console.");
    }

    setLoading(false);
  };

  const isDark = theme === "dark";

  function JSONNode({ data, level = 0 }: any) {
    const isObject = typeof data === "object" && data !== null;

    if (!isObject) {
      const type = typeof data;

      let color = isDark ? "text-yellow-400" : "text-amber-600"; // number
      if (type === "string") color = isDark ? "text-green-400" : "text-emerald-600";
      if (type === "boolean") color = isDark ? "text-blue-400" : "text-blue-600";
      if (data === null) color = isDark ? "text-gray-400" : "text-gray-500";

      return (
        <span className="relative">
          <span
            className={`${color} cursor-pointer`}
            onClick={() => {
              navigator.clipboard.writeText(String(data));
              setCopied(String(data));
              setTimeout(() => setCopied(null), 1200);
            }}
          >
            {JSON.stringify(data)}
          </span>
          {copied === String(data) && (
            <span className="absolute -top-5 left-0 text-[10px] bg-black text-white px-1.5 py-0.5 rounded">
              Copied
            </span>
          )}
        </span>
      );
    }

    const entries = Array.isArray(data)
      ? data.map((v, i) => [i, v])
      : Object.entries(data);

    return (
      <div className="pl-4 border-l border-white/10 space-y-1">
        {entries.map(([key, value]: any, index: number) => (
          <div key={index} className={`flex gap-2 text-xs px-1 rounded ${isDark ? "hover:bg-white/5" : "hover:bg-gray-200"}`}>
            <span
              className={`${isDark ? "text-purple-400" : "text-purple-600"} cursor-pointer`}
              onClick={() => {
                navigator.clipboard.writeText(String(key));
                setCopied(String(key));
                setTimeout(() => setCopied(null), 1200);
              }}
            >
              {JSON.stringify(key)}:
            </span>
            <JSONNode data={value} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`min-h-screen px-6 py-12 relative overflow-hidden ${isDark ? "bg-[#07070a] text-white" : "bg-[#f5f7fb] text-gray-900"}`}
    >

      {/* Dynamic Glow */}
      <div
        className="pointer-events-none absolute w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full"
        style={{
          top: mouse.y - 250,
          left: mouse.x - 250,
        }}
      />

      {/* Subtle backdrop blur */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,80,255,0.05),transparent_70%)]" />

      {/* NAVBAR */}
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center mb-16">
        <h1 className="text-lg font-semibold tracking-tight">MyJSON</h1>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
        >
          {isDark ? "Light" : "Dark"}
        </button>
      </div>

      {/* HERO + FORM */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid md:grid-cols-2 gap-16 items-center">
        {/* LEFT - TEXT */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
            Convert your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
              Google Sheets
            </span>
            <br /> into a powerful{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
              API
            </span>
          </h1>

          <p className="text-base opacity-70 max-w-md">
            Turn any sheet into a live JSON API in seconds. No backend needed.
          </p>
        </div>

        {/* RIGHT - FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className={`rounded-2xl p-6 border backdrop-blur-xl shadow-xl hover:scale-[1.01] transition-transform ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
              }`}
          >
            <div className="space-y-4">
              <input
                placeholder="Paste Google Sheet URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none transition ${isDark
                  ? "bg-black/40 border-white/10 focus:border-purple-500"
                  : "bg-white border-gray-300 focus:border-purple-500"
                  }`}
              />

              <input
                placeholder="Sheet Name (default: Sheet1)"
                value={sheet}
                onChange={(e) => setSheet(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none transition ${isDark
                  ? "bg-black/40 border-white/10 focus:border-purple-500"
                  : "bg-white border-gray-300 focus:border-purple-500"
                  }`}
              />

              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleGenerate}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition cursor-pointer"
              >
                Generate API
              </motion.button>

              {apiUrl && (
                <div
                  className={`text-xs px-3 py-2 rounded-md flex justify-between items-center ${isDark ? "bg-black/40" : "bg-gray-100"
                    }`}
                >
                  <span className="truncate text-purple-400">{apiUrl}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(apiUrl);
                      setCopied("api");
                      setTimeout(() => setCopied(null), 1200);
                    }}
                    className="ml-2 text-xs px-2 py-1 bg-white/10 rounded cursor-pointer"
                  >
                    {copied === "api" ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* RESPONSE */}
      {(loading || data) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto px-6 mt-16"
        >
          <div
            className={`rounded-2xl p-6 border shadow-xl ${isDark
              ? "bg-[#12121a] border-white/10"
              : "bg-white border-gray-200"
              }`}
          >
            {loading && (
              <div className="text-sm opacity-60">Fetching data…</div>
            )}

            {data && (
              <div className={`mt-4 h-96 overflow-auto rounded-lg p-4 text-xs font-mono leading-relaxed ${isDark ? "bg-black/50" : "bg-gray-50 border border-gray-200"}`}>
                <JSONNode data={data} />
              </div>
            )}
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}