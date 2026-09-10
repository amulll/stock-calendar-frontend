const DISPLAYABLE_YIELD_STATUSES = new Set(["ok", "review_required"]);

export function isYieldRankable(row) {
  return row?.annual_yield_status === "ok";
}

export function isYieldDisplayable(row) {
  return DISPLAYABLE_YIELD_STATUSES.has(row?.annual_yield_status);
}

export function yieldQualityRank(row) {
  if (row?.annual_yield_status === "ok") return 0;
  if (row?.annual_yield_status === "review_required") return 1;
  return 2;
}
