// app/sitemap.ts

export default function sitemap() {
  const base = "https://mysjon.unlinkly.com";

  const routes = [
    "",
    "/google-sheets-to-json",
    "/google-sheets-api",
    "/sheet-to-api",
    "/json-api-generator",
    "/google-sheet-database",
    "/use-google-sheets-as-database",
    "/convert-google-sheet-to-api",
    "/no-backend-api-tool",
    "/free-json-api-generator",
    "/google-sheets-rest-api",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
