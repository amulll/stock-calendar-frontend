const PROXY_BASE = "/api/proxy";

function buildUrl(path, params = {}) {
  const normalizedPath = path.replace(/^\/+/, "");
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return `${PROXY_BASE}/${normalizedPath}${query ? `?${query}` : ""}`;
}

export async function proxyGet(path, params = {}, init = {}) {
  const res = await fetch(buildUrl(path, params), {
    method: "GET",
    cache: "no-store",
    ...init,
  });

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? payload.detail || payload.error || `Request failed with status ${res.status}`
        : payload || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return payload;
}
