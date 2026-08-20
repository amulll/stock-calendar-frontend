import test from "node:test";
import assert from "node:assert/strict";

import { getFillPresentation } from "../lib/fillStatus.mjs";

const today = "2026-08-20";

test("maps every canonical backend fill state", () => {
  const cases = [
    [{ fill_status: "filled", days_to_fill: 5 }, "已填息 · 5 天"],
    [{ fill_status: "unfilled_after_window" }, "逾觀察期未填息"],
    [{ fill_status: "observing" }, "觀察中"],
    [{ fill_status: "not_calculated" }, "待計算"],
    [
      { fill_status: "not_applicable", ex_date: "2026-09-01" },
      "尚未除權息",
    ],
  ];

  cases.forEach(([record, expected]) => {
    assert.equal(getFillPresentation(record, today).label, expected);
  });
});

test("does not guess a missing backend state", () => {
  assert.equal(
    getFillPresentation({ ex_date: "2026-01-01" }, today).label,
    "狀態未提供"
  );
});
