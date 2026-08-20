export const DEFAULT_SHARES = 1000;

export function computeStockIncome(
  detail,
  shares,
  currentYear,
  costPrice
) {
  if (detail === undefined) {
    return { dataState: "loading", includedInTotals: false };
  }
  if (detail === null) {
    return { dataState: "load_failed", includedInTotals: false };
  }

  const info = detail?.info || null;
  const history = Array.isArray(detail?.history) ? detail.history : [];
  const marketPrice = Number(info?.daily_price) || 0;
  const effectiveCost = Number(costPrice) > 0 ? Number(costPrice) : marketPrice;
  const thisYear = history.filter((record) => {
    const dateStr = record.pay_date || record.ex_date;
    return (
      dateStr &&
      Number(dateStr.slice(0, 4)) === currentYear &&
      Number(record.cash_dividend) > 0
    );
  });

  let records = thisYear;
  if (records.length === 0) {
    const latest = [...history]
      .filter(
        (record) => record.ex_date && Number(record.cash_dividend) > 0
      )
      .sort((a, b) => new Date(b.ex_date) - new Date(a.ex_date))[0];
    records = latest ? [latest] : [];
  }

  const dataState =
    thisYear.length > 0
      ? "current_year"
      : records.length > 0
      ? "estimate"
      : "no_data";

  const annualCash = records.reduce(
    (sum, record) => sum + (Number(record.cash_dividend) || 0),
    0
  );
  const monthly = new Array(12).fill(0);
  records.forEach((record) => {
    const dateStr = record.pay_date || record.ex_date;
    if (!dateStr) return;
    const monthIndex = Number(dateStr.slice(5, 7)) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      monthly[monthIndex] += (Number(record.cash_dividend) || 0) * shares;
    }
  });

  return {
    name: info?.stock_name || null,
    dataState,
    includedInTotals: dataState === "current_year" || dataState === "estimate",
    marketPrice,
    costPrice: effectiveCost,
    isCustomCost: Number(costPrice) > 0,
    annualCash,
    income: annualCash * shares,
    cost: effectiveCost * shares,
    yieldRate: effectiveCost > 0 ? (annualCash / effectiveCost) * 100 : 0,
    monthly,
    usedEstimate: dataState === "estimate",
    hasData: annualCash > 0,
  };
}

export function summarizePortfolioRows(rows) {
  let income = 0;
  let cost = 0;
  const monthly = new Array(12).fill(0);

  rows.forEach(({ computed }) => {
    if (!computed?.includedInTotals) return;
    income += computed.income;
    cost += computed.cost;
    computed.monthly.forEach((value, index) => {
      monthly[index] += value;
    });
  });

  return {
    income,
    cost,
    monthly,
    yieldRate: cost > 0 ? (income / cost) * 100 : 0,
    maxMonth: Math.max(...monthly, 0),
    includedCount: rows.filter(({ computed }) => computed?.includedInTotals)
      .length,
    estimateCount: rows.filter(({ computed }) => computed?.usedEstimate).length,
    excludedCount: rows.filter(({ computed }) =>
      ["load_failed", "no_data"].includes(computed?.dataState)
    ).length,
    loadFailedCount: rows.filter(
      ({ computed }) => computed?.dataState === "load_failed"
    ).length,
    noDataCount: rows.filter(
      ({ computed }) => computed?.dataState === "no_data"
    ).length,
  };
}
