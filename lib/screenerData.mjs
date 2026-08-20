export async function fetchScreenerData({
  apiUrl,
  serviceToken,
  fetchImpl = fetch,
}) {
  try {
    const response = await fetchImpl(`${apiUrl}/api/screener`, {
      headers: { "X-Service-Token": serviceToken },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      console.error(`Screener fetch failed with status ${response.status}`);
      return { ok: false, rows: [], error: "upstream_unavailable" };
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error("Screener response was not an array");
      return { ok: false, rows: [], error: "invalid_response" };
    }
    return { ok: true, rows: data, error: null };
  } catch (error) {
    console.error("Screener fetch error:", error);
    return { ok: false, rows: [], error: "upstream_unavailable" };
  }
}
