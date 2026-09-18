import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getFillRatePresentation,
  getRecurringPeriodLabel,
} from "../lib/dividendPresentation.mjs";

test("labels a quarterly calculator result as one distribution, not annual income", () => {
  assert.equal(
    getRecurringPeriodLabel("季配"),
    "本次為單季配息，不代表全年累計。"
  );
  assert.equal(getRecurringPeriodLabel("年配"), null);
});

test("shows fill-rate sample and warns when historical coverage is low", () => {
  assert.deepEqual(
    getFillRatePresentation({
      fill_rate: 100,
      successful_fill_events: 4,
      evaluated_fill_events: 4,
      total_ex_events: 11,
    }),
    {
      primary: "100% (4/4)",
      coverage: "涵蓋 4/11",
      isLowCoverage: true,
    }
  );
});

test("stock page and calculator use the same historical-event prop contract", async () => {
  const [stockPage, calculator] = await Promise.all([
    readFile(new URL("../app/stock/[id]/page.js", import.meta.url), "utf8"),
    readFile(new URL("../components/DividendCalculator.js", import.meta.url), "utf8"),
  ]);
  const combinedSource = `${stockPage}\n${calculator}`;

  assert.doesNotMatch(combinedSource, /isHistoricalEstimate/);
  assert.match(stockPage, /isHistoricalEvent=\{!hasUpcomingEvent\}/);
  assert.match(calculator, /isHistoricalEvent\s*=\s*false/);
  assert.match(calculator, /isHistoricalEvent\s*\?/);
});
