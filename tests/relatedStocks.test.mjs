import test from "node:test";
import assert from "node:assert/strict";

import { buildRelatedStockSections } from "../lib/relatedStocks.mjs";

test("builds labelled sections from related groups and skips empty groups", () => {
  const sections = buildRelatedStockSections({
    same_industry: [{ stock_code: "2539", stock_name: "櫻花建", industry_type: "建材營造業" }],
    nearby_ex_date: [{ stock_code: "2881", stock_name: "富邦金", reference_ex_date: "2026-07-17" }],
    similar_yield: [],
  });

  assert.deepEqual(sections.map((section) => section.key), ["same_industry", "nearby_ex_date"]);
  assert.equal(sections[0].title, "同產業股利研究：建材營造業");
  assert.equal(sections[0].links[0].context, null);
  assert.equal(sections[1].links[0].context, "除權息 2026-07-17");
});

test("shows yield context only for finite yields", () => {
  const [section] = buildRelatedStockSections({
    similar_yield: [
      { stock_code: "A", current_year_yield: 5.2 },
      { stock_code: "B", current_year_yield: null },
      { stock_name: "缺代號" },
    ],
  });

  assert.deepEqual(section.links.map((link) => link.context), ["殖利率 5.20%", null]);
  assert.equal(section.links[1].stockName, "B");
});

test("falls back to legacy same-industry links when groups are absent", () => {
  const sections = buildRelatedStockSections(undefined, [{ stock_code: "2548", stock_name: "華固" }]);

  assert.equal(sections.length, 1);
  assert.equal(sections[0].title, "同產業股利研究");
  assert.equal(sections[0].links[0].stockCode, "2548");
  assert.deepEqual(buildRelatedStockSections(null, []), []);
});
