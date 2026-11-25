// 除權息月份瀏覽頁 (/ex-dividend/YYYY-MM) 的純函式：月份範圍、資料抓取、分組與摘要。
// 以「除息日（除權日）所在月份」歸類，與首頁以發放日為主的日曆區隔。

import { getTaipeiDate } from "./stockMetadata.mjs";
import { getEventYield } from "./yieldMetrics.mjs";

// 與 lib/dividendEvent.js 的 getDividendType 規則相同；.mjs 測試環境不直接引用 .js 模組
export function getEventType(item) {
  const cash = Number(item?.cash_dividend || 0);
  const stock = Number(item?.stock_dividend || 0);
  if (cash > 0 && stock > 0) return "both";
  if (cash > 0) return "cash";
  if (stock > 0) return "stock";
  return "none";
}

export const EVENT_TYPE_LABELS = {
  cash: "除息",
  stock: "除權",
  both: "除權息",
  none: "待公告",
};

export const MONTHS_BACK = 24;
export const MONTHS_FORWARD = 3;
// 與後端 YIELD_REVIEW_THRESHOLD 一致：超過者視為待複核，不列入「本月較高殖利率」摘要
export const YIELD_REVIEW_THRESHOLD = 15;

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function pad(value) {
  return String(value).padStart(2, "0");
}

export function monthSlug({ year, month }) {
  return `${year}-${pad(month)}`;
}

export function parseMonthSlug(slug) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(slug || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function monthIndex({ year, month }) {
  return year * 12 + (month - 1);
}

function fromIndex(index) {
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function addMonths(value, delta) {
  return fromIndex(monthIndex(value) + delta);
}

export function getCurrentTaipeiMonth(now = new Date()) {
  const [year, month] = getTaipeiDate(now).split("-").map(Number);
  return { year, month };
}

// 由新到舊：未來 3 個月 → 本月 → 過去 24 個月
export function getMonthWindow(now = new Date()) {
  const current = getCurrentTaipeiMonth(now);
  const months = [];
  for (let delta = MONTHS_FORWARD; delta >= -MONTHS_BACK; delta -= 1) {
    months.push(addMonths(current, delta));
  }
  return months;
}

export function isMonthInWindow(value, now = new Date()) {
  const current = monthIndex(getCurrentTaipeiMonth(now));
  const target = monthIndex(value);
  return target >= current - MONTHS_BACK && target <= current + MONTHS_FORWARD;
}

export function getAdjacentMonths(value, now = new Date()) {
  const prev = addMonths(value, -1);
  const next = addMonths(value, 1);
  return {
    prev: isMonthInWindow(prev, now) ? prev : null,
    next: isMonthInWindow(next, now) ? next : null,
  };
}

export async function fetchExMonthDividends({
  apiUrl,
  serviceToken,
  year,
  month,
  fetchImpl = fetch,
  revalidate = 3600,
}) {
  try {
    const response = await fetchImpl(
      `${apiUrl}/api/dividends/by-ex-month?year=${year}&month=${month}`,
      {
        headers: { "X-Service-Token": serviceToken },
        next: { revalidate },
      }
    );
    if (!response.ok) {
      console.error(`Ex-month dividends fetch failed with status ${response.status}`);
      return { ok: false, rows: [], error: "upstream_unavailable" };
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error("Ex-month dividends response was not an array");
      return { ok: false, rows: [], error: "invalid_response" };
    }
    return { ok: true, rows: data, error: null };
  } catch (error) {
    console.error("Ex-month dividends fetch error:", error);
    return { ok: false, rows: [], error: "upstream_unavailable" };
  }
}

// "2026-12-03" → { month: 12, day: 3, weekday: "四" }，以字串解析避免時區位移
export function describeDate(isoDate) {
  const [year, month, day] = String(isoDate).slice(0, 10).split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return { year, month, day, weekday };
}

export function groupByExDate(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!row?.ex_date) continue;
    const key = String(row.ex_date).slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      items: [...items].sort((a, b) => String(a.stock_code).localeCompare(String(b.stock_code))),
    }));
}

export function summarizeMonth(rows) {
  const valid = rows.filter((row) => row?.ex_date);
  const typeCounts = { cash: 0, stock: 0, both: 0, none: 0 };
  for (const row of valid) typeCounts[getEventType(row)] += 1;

  const groups = groupByExDate(valid);
  const busiest = groups.reduce(
    (best, group) => (!best || group.items.length > best.items.length ? group : best),
    null
  );

  const topYields = valid
    .map((row) => ({ row, yield: getEventYield(row) }))
    .filter((item) => item.yield != null && item.yield <= YIELD_REVIEW_THRESHOLD)
    .sort((a, b) => b.yield - a.yield || String(a.row.stock_code).localeCompare(String(b.row.stock_code)))
    .slice(0, 5);

  const lastUpdated = valid.reduce((latest, row) => {
    const value = row.updated_at;
    return value && (!latest || value > latest) ? value : latest;
  }, null);

  return {
    total: valid.length,
    typeCounts,
    tradingDays: groups.length,
    firstDate: groups[0]?.date || null,
    busiest: busiest ? { date: busiest.date, count: busiest.items.length } : null,
    topYields,
    lastUpdated,
  };
}
