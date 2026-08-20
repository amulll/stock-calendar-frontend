import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStockMetadataTitle,
  getTaipeiYear,
  hasDividendEventForYear,
} from "../lib/stockMetadata.mjs";

test("uses Taipei calendar year", () => {
  assert.equal(getTaipeiYear(new Date("2025-12-31T16:30:00Z")), 2026);
});
test("detects current-year ex-date or pay-date payout data", () => {
  assert.equal(
    hasDividendEventForYear(
      [{ ex_date: "2025-12-20", pay_date: "2026-01-20", cash_dividend: 1 }],
      2026
    ),
    true
  );
  assert.equal(
    hasDividendEventForYear(
      [{ ex_date: "2026-01-20", cash_dividend: 0, stock_dividend: 0 }],
      2026
    ),
    false
  );
});

test("uses current year only when matching event data exists", () => {
  const now = new Date("2026-08-20T00:00:00Z");
  assert.match(
    buildStockMetadataTitle({
      stockName: "測試公司",
      stockCode: "1234",
      history: [{ ex_date: "2026-07-01", cash_dividend: 1 }],
      now,
    }),
    /2026 股利配息日/
  );
  assert.match(
    buildStockMetadataTitle({
      stockName: "測試公司",
      stockCode: "1234",
      history: [{ ex_date: "2025-07-01", cash_dividend: 1 }],
      now,
    }),
    /最新股利、歷年配息/
  );
});
