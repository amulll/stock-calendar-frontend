// A published event's dividend and reference price must stay on the same
// per-share basis. This avoids comparing a pre-split dividend with a
// post-split latest market price.
export function getEventYield(item) {
  const cash = Number(item?.cash_dividend || 0);
  const referencePrice = Number(item?.stock_price || 0);
  if (cash <= 0 || referencePrice <= 0) return null;
  return (cash / referencePrice) * 100;
}
