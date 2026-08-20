export function getTaipeiYear(now = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Taipei",
      year: "numeric",
    }).format(now)
  );
}
export function hasDividendEventForYear(history, year) {
  return (Array.isArray(history) ? history : []).some((record) => {
    const hasPayout =
      Number(record?.cash_dividend || 0) > 0 ||
      Number(record?.stock_dividend || 0) > 0;
    if (!hasPayout) return false;
    return [record?.ex_date, record?.pay_date].some(
      (value) => typeof value === "string" && Number(value.slice(0, 4)) === year
    );
  });
}

export function buildStockMetadataTitle({ stockName, stockCode, history, now }) {
  const currentYear = getTaipeiYear(now);
  if (hasDividendEventForYear(history, currentYear)) {
    return `${stockName} (${stockCode}) ${currentYear} 股利配息日、殖利率與股利計算 - uGoodly`;
  }
  return `${stockName} (${stockCode}) 最新股利、歷年配息、殖利率與股利計算 - uGoodly`;
}
