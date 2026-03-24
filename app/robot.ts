// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://mysjon.unlinkly.com/sitemap.xml",
  };
}
