import assert from "node:assert/strict";
import test from "node:test";

import { getEventYield } from "../lib/yieldMetrics.mjs";

test("event yield keeps a pre-split dividend paired with its event price", () => {
  const value = getEventYield({ cash_dividend: 25.5, stock_price: 677 });

  assert.equal(value.toFixed(2), "3.77");
});

test("event yield does not fall back to an unrelated latest price", () => {
  assert.equal(getEventYield({ cash_dividend: 25.5, stock_price: null }), null);
});
