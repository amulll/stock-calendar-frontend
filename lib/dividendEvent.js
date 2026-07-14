// 依現金/股票股利推導除權息事件類型與正確標籤。
// 台股：除息=配現金、除權=配股票，兩者可不同天，不可一律當「除息」。

export function getDividendType(item) {
  const cash = Number(item?.cash_dividend || 0);
  const stock = Number(item?.stock_dividend || 0);
  if (cash > 0 && stock > 0) return "both"; // 除權息
  if (cash > 0) return "cash"; // 除息（純配息）
  if (stock > 0) return "stock"; // 除權（純配股）
  return "none";
}

// 單一事件的基準日標籤：除息日 / 除權日 / 除權息日
export function exDateLabel(item) {
  switch (getDividendType(item)) {
    case "stock":
      return "除權日";
    case "both":
      return "除權息日";
    default:
      return "除息日"; // 純配息或尚未公告，皆以除息日表示
  }
}

// 單一事件的配發標籤：現金優先，否則配股，否則未公告
export function dividendAmountLabel(item) {
  const cash = Number(item?.cash_dividend || 0);
  const stock = Number(item?.stock_dividend || 0);
  if (cash > 0) return `${cash} 元`;
  if (stock > 0) return `配股 ${stock}`;
  return "未公告";
}
