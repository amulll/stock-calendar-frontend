import test from "node:test";
import assert from "node:assert/strict";

import {
  describeDate,
  fetchExMonthDividends,
  getAdjacentMonths,
  getCurrentTaipeiMonth,
  getMonthWindow,
  groupByExDate,
  isMonthInWindow,
  monthSlug,
  parseMonthSlug,
  summarizeMonth,
} from "../lib/exDividendMonths.mjs";

// 2026-11-30 16:30 UTC = 2026-12-01 00:30 台北時間
const NEAR_MIDNIGHT = new Date("2026-11-30T16:30:00Z");
const NOW = new Date("2026-11-25T04:00:00Z");

test("month slug round-trips and rejects malformed values", () => {
  assert.deepEqual(parseMonthSlug("2026-01"), { year: 2026, month: 1 });
  assert.equal(monthSlug({ year: 2026, month: 1 }), "2026-01");
  for (const bad of ["2026-1", "2026-13", "2026-00", "26-01", "2026-01-01", "", null, "abcd-ef"]) {
    assert.equal(parseMonthSlug(bad), null, `${bad} should be rejected`);
  }
});

test("current month follows Taipei time, not UTC", () => {
  assert.deepEqual(getCurrentTaipeiMonth(NEAR_MIDNIGHT), { year: 2026, month: 12 });
});

test("window covers 24 months back and 3 months forward, newest first", () => {
  const months = getMonthWindow(NOW);
  assert.equal(months.length, 28);
  assert.deepEqual(months[0], { year: 2027, month: 2 });
  assert.deepEqual(months[3], { year: 2026, month: 11 });
  assert.deepEqual(months.at(-1), { year: 2024, month: 11 });

  assert.equal(isMonthInWindow({ year: 2027, month: 2 }, NOW), true);
  assert.equal(isMonthInWindow({ year: 2027, month: 3 }, NOW), false);
  assert.equal(isMonthInWindow({ year: 2024, month: 11 }, NOW), true);
  assert.equal(isMonthInWindow({ year: 2024, month: 10 }, NOW), false);
});

test("adjacent months cross years and stop at window edges", () => {
  assert.deepEqual(getAdjacentMonths({ year: 2026, month: 1 }, NOW), {
    prev: { year: 2025, month: 12 },
    next: { year: 2026, month: 2 },
  });
  assert.deepEqual(getAdjacentMonths({ year: 2027, month: 2 }, NOW).next, null);
  assert.deepEqual(getAdjacentMonths({ year: 2024, month: 11 }, NOW).prev, null);
});

test("describeDate parses ISO strings without timezone drift", () => {
  assert.deepEqual(describeDate("2026-12-03"), { year: 2026, month: 12, day: 3, weekday: "四" });
});

const ROWS = [
  { stock_code: "2330", stock_name: "台積電", ex_date: "2026-12-11", cash_dividend: 5, stock_dividend: 0, stock_price: 1000, updated_at: "2026-11-20T01:00:00" },
  { stock_code: "1605", stock_name: "華新", ex_date: "2026-12-03", cash_dividend: 0.5, stock_dividend: 0, stock_price: 10, updated_at: "2026-11-24T06:00:00" },
  { stock_code: "1101", stock_name: "台泥", ex_date: "2026-12-03", cash_dividend: 1, stock_dividend: 0.5, stock_price: 20 },
  { stock_code: "9999", stock_name: "待複核", ex_date: "2026-12-03", cash_dividend: 5, stock_dividend: 0, stock_price: 10 },
  { stock_code: "8888", stock_name: "配股", ex_date: "2026-12-11", cash_dividend: 0, stock_dividend: 1, stock_price: 30 },
  { stock_code: "0000", stock_name: "缺日期", ex_date: null, cash_dividend: 1, stock_dividend: 0 },
];

test("groups by ex-date ascending with stock code order inside a day", () => {
  const groups = groupByExDate(ROWS);
  assert.deepEqual(groups.map((group) => group.date), ["2026-12-03", "2026-12-11"]);
  assert.deepEqual(groups[0].items.map((row) => row.stock_code), ["1101", "1605", "9999"]);
});

test("summary counts types, busiest day, and excludes review-threshold yields", () => {
  const summary = summarizeMonth(ROWS);
  assert.equal(summary.total, 5);
  assert.deepEqual(summary.typeCounts, { cash: 3, stock: 1, both: 1, none: 0 });
  assert.equal(summary.tradingDays, 2);
  assert.deepEqual(summary.busiest, { date: "2026-12-03", count: 3 });
  // 9999 殖利率 50% 超過 15% 待複核門檻，不得進入摘要
  assert.deepEqual(summary.topYields.map((item) => item.row.stock_code), ["1101", "1605", "2330"]);
  assert.equal(summary.lastUpdated, "2026-11-24T06:00:00");
});

test("empty month summary is a legitimate zero result", () => {
  const summary = summarizeMonth([]);
  assert.equal(summary.total, 0);
  assert.equal(summary.busiest, null);
  assert.deepEqual(summary.topYields, []);
});

test("fetch builds the ex-month URL and separates upstream failure from empty data", async () => {
  let calledUrl = null;
  const ok = await fetchExMonthDividends({
    apiUrl: "https://example.test",
    serviceToken: "test",
    year: 2026,
    month: 12,
    fetchImpl: async (url) => {
      calledUrl = url;
      return { ok: true, json: async () => [] };
    },
  });
  assert.equal(calledUrl, "https://example.test/api/dividends/by-ex-month?year=2026&month=12");
  assert.deepEqual(ok, { ok: true, rows: [], error: null });

  const failed = await fetchExMonthDividends({
    apiUrl: "https://example.test",
    serviceToken: "test",
    year: 2026,
    month: 12,
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });
  assert.equal(failed.ok, false);

  const invalid = await fetchExMonthDividends({
    apiUrl: "https://example.test",
    serviceToken: "test",
    year: 2026,
    month: 12,
    fetchImpl: async () => ({ ok: true, json: async () => ({ detail: "x" }) }),
  });
  assert.deepEqual(invalid, { ok: false, rows: [], error: "invalid_response" });
});
