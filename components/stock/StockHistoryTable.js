import { Calendar } from "lucide-react";

// 強制顯示 3 位小數
function formatDividend(val) {
  return Number(val || 0).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function getYear(record) {
  if (record.pay_date) return record.pay_date.split("-")[0];
  if (record.ex_date) return record.ex_date.split("-")[0];
  return "-";
}

function getTaipeiToday() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function getFillState(record, today) {
  if (record.days_to_fill > 0) {
    return {
      label: `${record.days_to_fill} 天`,
      tone: "border-slate-200 bg-slate-100 text-slate-600",
    };
  }
  if (record.days_to_fill === -1) {
    return { label: "逾一年未填息", tone: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  if (record.days_to_fill === 0) {
    return { label: "資料待更新", tone: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  if (!record.ex_date) {
    return { label: "尚未計算", tone: "border-slate-200 bg-slate-50 text-slate-500" };
  }
  if (record.ex_date >= today) {
    return { label: "尚未除權息", tone: "border-slate-200 bg-slate-50 text-slate-500" };
  }
  return { label: "觀察中", tone: "border-blue-200 bg-blue-50 text-blue-700" };
}

// 歷史發放紀錄表：同年度多筆會用 rowSpan 合併「年度 / 年股利」欄位。
// 單次殖利率不可直接相加為年度殖利率，因此逐事件顯示。
export default function StockHistoryTable({ history }) {
  const today = getTaipeiToday();

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <h2 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-base font-black tracking-tight text-slate-900">
        <Calendar className="text-slate-500" /> 歷史發放紀錄
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs md:text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-2 py-2 whitespace-nowrap">年度</th>
              <th className="px-2 py-2 whitespace-nowrap">股利</th>
              <th className="px-2 py-2 whitespace-nowrap">發放日</th>
              <th className="px-2 py-2 whitespace-nowrap">除權息日</th>
              <th className="px-2 py-2 whitespace-nowrap">股利(年)</th>
              <th className="px-2 py-2 whitespace-nowrap">單次殖利率</th>
              <th className="px-2 py-2 whitespace-nowrap">填息天數</th>
              <th className="px-2 py-2 whitespace-nowrap">除息前股價</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {history.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-2 py-8 text-center text-slate-400">
                  無過去紀錄
                </td>
              </tr>
            ) : (
              history.map((item, index) => {
                const currentYear = getYear(item);
                const prevYear = index > 0 ? getYear(history[index - 1]) : null;
                const isFirstOfGroup = currentYear !== prevYear;

                let rowSpanCount = 1;
                let totalCash = 0;

                if (isFirstOfGroup) {
                  totalCash += Number(item.cash_dividend || 0);
                  for (let i = index + 1; i < history.length; i++) {
                    if (getYear(history[i]) === currentYear) {
                      rowSpanCount++;
                      totalCash += Number(history[i].cash_dividend || 0);
                    } else {
                      break;
                    }
                  }
                }

                const formatSmartDate = (dateStr) => {
                  if (!dateStr) return null;
                  const [y, m, d] = dateStr.split("-");
                  if (y === currentYear) return `${m}/${d}`;
                  return `${y}/${m}/${d}`;
                };
                const fillState = getFillState(item, today);

                return (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    {isFirstOfGroup && (
                      <td
                        rowSpan={rowSpanCount}
                        className="px-2 py-2 text-slate-600 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200 bg-slate-50"
                      >
                        {currentYear}
                      </td>
                    )}
                    <td className="px-2 py-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {Number(item.cash_dividend) > 0 && (
                          <span>{formatDividend(item.cash_dividend)}</span>
                        )}
                        {Number(item.stock_dividend) > 0 && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            配股 {formatDividend(item.stock_dividend)}
                          </span>
                        )}
                        {!(Number(item.cash_dividend) > 0) &&
                          !(Number(item.stock_dividend) > 0) && <span>-</span>}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-medium text-slate-700 whitespace-nowrap">
                      {item.pay_date ? (
                        <a
                          href={`/?date=${item.pay_date}&openModal=true`}
                          className="text-blue-600 hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2"
                        >
                          {formatSmartDate(item.pay_date)}
                        </a>
                      ) : (
                        "未定"
                      )}
                    </td>
                    <td className="px-2 py-2 text-slate-500 whitespace-nowrap">
                      {item.ex_date ? (
                        <a
                          href={`/?date=${item.ex_date}`}
                          className="hover:text-blue-600 hover:underline decoration-slate-300 underline-offset-2"
                        >
                          {formatSmartDate(item.ex_date)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    {isFirstOfGroup && (
                      <td
                        rowSpan={rowSpanCount}
                        className="px-2 py-2 font-mono font-bold text-slate-900 whitespace-nowrap text-center align-middle bg-slate-50 border-l border-slate-200"
                      >
                        {formatDividend(totalCash)}
                        {rowSpanCount > 1 && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (合計)
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-2 py-2 text-center font-medium whitespace-nowrap">
                      {Number(item.yield_rate) > 0 ? (
                        <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
                          {formatDividend(item.yield_rate)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-2 py-2 text-slate-400 whitespace-nowrap text-center">
                      <span className={`rounded border px-2 py-0.5 text-xs ${fillState.tone}`}>
                        {fillState.label}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-600 whitespace-nowrap">
                      {item.stock_price > 0 ? `$${item.stock_price}` : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
