export function getRecurringPeriodLabel(frequency) {
  return {
    月配: "本次為單月配息，不代表全年累計。",
    季配: "本次為單季配息，不代表全年累計。",
    半年配: "本次為單次半年配息，不代表全年累計。",
  }[frequency] || null;
}

export function getFillRatePresentation(row) {
  const evaluated = Number(row?.evaluated_fill_events ?? row?.total_ex_events ?? 0);
  if (evaluated <= 0) return null;

  const successful = Number(row?.successful_fill_events ?? 0);
  const total = Number(row?.total_ex_events ?? 0);
  const hasPartialCoverage = total > evaluated;

  return {
    primary: `${Number(row?.fill_rate ?? 0)}% (${successful}/${evaluated})`,
    coverage: hasPartialCoverage ? `涵蓋 ${evaluated}/${total}` : null,
    isLowCoverage: hasPartialCoverage && evaluated / total < 0.5,
  };
}
