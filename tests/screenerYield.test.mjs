import assert from "node:assert/strict";
import test from "node:test";

import {
  isYieldDisplayable,
  isYieldRankable,
  yieldQualityRank,
} from "../lib/screenerYield.mjs";

test("legacy payloads without quality status fail closed", () => {
  const legacy = { annual_yield: 35.37 };

  assert.equal(isYieldRankable(legacy), false);
  assert.equal(isYieldDisplayable(legacy), false);
  assert.equal(yieldQualityRank(legacy), 2);
});

test("review-required values stay visible but are not rankable", () => {
  const review = { annual_yield: 16, annual_yield_status: "review_required" };

  assert.equal(isYieldRankable(review), false);
  assert.equal(isYieldDisplayable(review), true);
  assert.equal(yieldQualityRank(review), 1);
});

test("validated values are visible and rankable", () => {
  const valid = { annual_yield: 3.77, annual_yield_status: "ok" };

  assert.equal(isYieldRankable(valid), true);
  assert.equal(isYieldDisplayable(valid), true);
  assert.equal(yieldQualityRank(valid), 0);
});
