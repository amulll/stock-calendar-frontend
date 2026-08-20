import { DEFAULT_BACKEND_URL } from "./backend";

export async function getScreenerData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
  const serviceToken = process.env.SERVICE_TOKEN;

  try {
    const response = await fetch(`${apiUrl}/api/screener`, {
      headers: { "X-Service-Token": serviceToken },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Screener fetch error:", error);
    return [];
  }
}
