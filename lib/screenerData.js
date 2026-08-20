import { DEFAULT_BACKEND_URL } from "./backend";
import { fetchScreenerData } from "./screenerData.mjs";

export function getScreenerData(options = {}) {
  return fetchScreenerData({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL,
    serviceToken: process.env.SERVICE_TOKEN,
    ...options,
  });
}
