import { getServerBackendUrl } from "./backend";
import { fetchExMonthDividends } from "./exDividendMonths.mjs";

export function getExMonthDividends({ year, month, ...options }) {
  return fetchExMonthDividends({
    apiUrl: getServerBackendUrl(),
    serviceToken: process.env.SERVICE_TOKEN,
    year,
    month,
    ...options,
  });
}
