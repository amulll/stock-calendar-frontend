import assert from "node:assert/strict";

const baseUrl = process.env.SMOKE_BASE_URL || "https://ugoodly.com";

async function fetchText(path) {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${baseUrl}${path}${separator}cb=${Date.now()}-${Math.random()}`, {
    headers: { "User-Agent": "uGoodly-production-smoke/1.0" },
  });
  assert.equal(response.status, 200, `${path} returned HTTP ${response.status}`);
  return response.text();
}

function robotsContent(html) {
  return html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i)?.[1]
    || "";
}

const [deepPage, thinPage, sitemap] = await Promise.all([
  fetchText("/stock/5904"),
  fetchText("/stock/8084"),
  fetchText("/sitemap.xml"),
]);

assert.ok(Buffer.byteLength(deepPage, "utf8") >= 50_000, "5904 SSR HTML fell below 50 KB");
assert.match(deepPage, /寶雅/, "5904 SSR HTML is missing the company name");
assert.match(robotsContent(deepPage), /(^|\s|,)index(\s|,|$)/i, "5904 is not indexable");
assert.doesNotMatch(robotsContent(deepPage), /noindex/i, "5904 unexpectedly has noindex");
assert.match(robotsContent(thinPage), /noindex/i, "8084 is not marked noindex");

const stockUrls = sitemap.match(/<loc>https:\/\/ugoodly\.com\/stock\//g) || [];
const lastModified = sitemap.match(/<lastmod>/g) || [];
assert.ok(stockUrls.length >= 1_000, `sitemap only contains ${stockUrls.length} stock URLs`);
assert.equal(lastModified.length, stockUrls.length, "stock sitemap URLs and lastmod counts differ");
assert.match(sitemap, /<loc>https:\/\/ugoodly\.com\/stock\/5904<\/loc>/, "5904 is missing from sitemap");
assert.doesNotMatch(sitemap, /<loc>https:\/\/ugoodly\.com\/stock\/8084<\/loc>/, "8084 should not be in sitemap");

const relatedStockLinks = new Set(
  [...deepPage.matchAll(/href=["']\/stock\/([A-Z0-9]+)["']/g)].map((match) => match[1])
);
assert.ok(relatedStockLinks.size >= 12, `5904 only exposes ${relatedStockLinks.size} related stock links`);

console.log(JSON.stringify({
  baseUrl,
  stockUrls: stockUrls.length,
  lastModified: lastModified.length,
  deepPageBytes: Buffer.byteLength(deepPage, "utf8"),
  relatedStockLinks: relatedStockLinks.size,
  deepRobots: robotsContent(deepPage),
  thinRobots: robotsContent(thinPage),
}, null, 2));
