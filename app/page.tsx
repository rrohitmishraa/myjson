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

  const [mounted, setMounted] = useState(false);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
    setMounted(true);
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

    const endpoint = `/api/sheet/${sheetId}/${sheet}`;

    // Debug API endpoint
    console.log("API Endpoint:", endpoint);

    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${endpoint}`
        : endpoint;

    setApiUrl(fullUrl);
    setLoading(true);

    try {
      // 🔥 always fetch fresh data (no cache anywhere)
      const res = await fetch(`${endpoint}?t=${Date.now()}`, {
        cache: "no-store",
      });
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
      <motion.div
        className="pl-4 space-y-1"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.02
            }
          }
        }}
      >
        {entries.map(([key, value]: any, index: number) => (
          <div
            key={index}
            className="flex gap-2 text-xs px-1 rounded"
          >
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
      </motion.div>
    );
  }

  if (!mounted) return null;

  return (
    <motion.div
      className={`h-screen px-6 py-16 relative flex flex-col overflow-hidden ${isDark ? "bg-[#07070a] text-white" : "bg-[#f5f7fb] text-gray-900"}`}
    >

      {/* Dynamic Glow */}
      <div
        className={`pointer-events-none absolute w-[500px] h-[500px] blur-[120px] rounded-full ${isDark ? "bg-purple-600/20" : "bg-purple-600/10"}`}
        style={{
          top: Math.max(0, mouse.y - 250),
          left: Math.max(0, mouse.x - 250),
        }}
      />

      {/* Subtle backdrop blur */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,80,255,0.05),transparent_70%)]" />

      {/* NAVBAR */}
      <div className="w-[80%] mx-auto px-6 flex justify-between items-center mb-8">
        <h1 className="text-lg font-semibold tracking-tight">MyJSON</h1>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
        >
          {isDark ? "Light" : "Dark"}
        </button>
      </div>

      {/* HERO + FORM */}
      <div className="w-[80%] mx-auto px-6 mt-4 grid md:grid-cols-2 gap-16 items-center shrink-0">
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
              <div className="relative">
                <input
                  placeholder="Paste Google Sheet URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const next = document.getElementById("sheet-input");
                      next?.focus();
                    }
                  }}
                  className={`w-full px-4 py-3 pr-10 rounded-lg text-sm border outline-none transition ${isDark
                    ? "bg-black/40 border-white/10 focus:border-purple-500"
                    : "bg-white border-gray-300 focus:border-purple-500"
                    }`}
                />

                {url && (
                  <button
                    onClick={() => setUrl("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  id="sheet-input"
                  placeholder="Sheet Name (default: Sheet1)"
                  value={sheet}
                  onChange={(e) => setSheet(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  className={`w-full px-4 py-3 pr-10 rounded-lg text-sm border outline-none transition ${isDark
                    ? "bg-black/40 border-white/10 focus:border-purple-500"
                    : "bg-white border-gray-300 focus:border-purple-500"
                    }`}
                />

                {sheet && (
                  <button
                    onClick={() => setSheet("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
          {!data && (
            <p className="text-sm opacity-50 mt-6 text-center">
              Paste your sheet link and generate your API ↓
            </p>
          )}
        </motion.div>
      </div>


      {!data && !loading && (
        <div className="w-[80%] mx-auto px-6 mt-16 select-none pointer-events-none shrink-0">
          <motion.div>
            <div
              className={`rounded-2xl p-6 border border-dashed ${isDark
                ? "bg-[#12121a]/40 border-white/10"
                : "bg-white/50 border-gray-300"
                }`}
            >
              <p className="text-xs uppercase tracking-wide opacity-40 mb-3">
                Preview
              </p>

              <pre className="text-xs font-mono opacity-40">
                {`{
  "example": "your data",
  "rows": 10,
  "status": "ready"
}`}
              </pre>
            </div>
          </motion.div>
        </div>
      )}

      {/* RESPONSE */}
      {(loading || data) && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-[80%] mx-auto px-6 mt-10 flex-1 flex flex-col overflow-hidden"
        >
          <div className="w-full flex-1 flex flex-col min-h-0">
            {loading && (
              <motion.div
                className="text-sm opacity-60 text-center"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                Fetching data…
              </motion.div>
            )}

            {data && (
              <motion.div
                layoutId="json-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`mt-4 h-[480px] overflow-y-auto overflow-x-hidden text-xs font-mono leading-relaxed rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} px-4 py-4 bg-white/50`}
              >
                <JSONNode data={data} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}


    </motion.div>
  );
}