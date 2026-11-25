import { DEFAULT_BACKEND_URL } from "./backend";
import { fetchExMonthDividends } from "./exDividendMonths.mjs";

export function getExMonthDividends({ year, month, ...options }) {
  return fetchExMonthDividends({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL,
    serviceToken: process.env.SERVICE_TOKEN,
    year,
    month,
    ...options,
  });
}
