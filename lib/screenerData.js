import { getServerBackendUrl } from "./backend";
import { fetchScreenerData } from "./screenerData.mjs";

export function getScreenerData(options = {}) {
  return fetchScreenerData({
    apiUrl: getServerBackendUrl(),
    serviceToken: process.env.SERVICE_TOKEN,
    ...options,
  });
}
