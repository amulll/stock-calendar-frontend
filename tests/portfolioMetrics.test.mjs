import test from "node:test";
import assert from "node:assert/strict";

import {
  computeStockIncome,
  summarizePortfolioRows,
} from "../lib/portfolioMetrics.mjs";

test("uses all announced current-year cash events", () => {
  const computed = computeStockIncome(
    {
      info: { stock_name: "測試股", daily_price: 50 },
      history: [
        { ex_date: "2026-02-01", pay_date: "2026-03-01", cash_dividend: 1 },
        { ex_date: "2026-08-01", pay_date: "2026-09-01", cash_dividend: 2 },
        { ex_date: "2025-08-01", pay_date: "2025-09-01", cash_dividend: 9 },
      ],
    },
    1000,
    2026,
    ""
  );

  assert.equal(computed.annualCash, 3);
  assert.equal(computed.income, 3000);
  assert.equal(computed.usedEstimate, false);
  assert.equal(computed.monthly[2], 1000);
  assert.equal(computed.monthly[8], 2000);
});

test("labels latest-event fallback as an estimate", () => {
  const computed = computeStockIncome(
    {
      info: { stock_name: "測試股", daily_price: 100 },
      history: [
        { ex_date: "2025-06-01", pay_date: "2025-07-01", cash_dividend: 4 },
      ],
    },
    1000,
    2026,
    80
  );

  assert.equal(computed.usedEstimate, true);
  assert.equal(computed.income, 4000);
  assert.equal(computed.yieldRate, 5);

  const totals = summarizePortfolioRows([{ computed }]);
  assert.equal(totals.estimateCount, 1);
  assert.equal(totals.income, 4000);
});
