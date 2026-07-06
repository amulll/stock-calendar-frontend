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

// 歷史發放紀錄表：同年度多筆會用 rowSpan 合併「年度 / 年股利 / 年殖利率」欄位
export default function StockHistoryTable({ history }) {
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
              <th className="px-2 py-2 whitespace-nowrap">除息日</th>
              <th className="px-2 py-2 whitespace-nowrap">股利(年)</th>
              <th className="px-2 py-2 whitespace-nowrap">殖利率(年)</th>
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
                let totalYield = 0;

                if (isFirstOfGroup) {
                  totalCash += Number(item.cash_dividend || 0);
                  totalYield += Number(item.yield_rate || 0);
                  for (let i = index + 1; i < history.length; i++) {
                    if (getYear(history[i]) === currentYear) {
                      rowSpanCount++;
                      totalCash += Number(history[i].cash_dividend || 0);
                      totalYield += Number(history[i].yield_rate || 0);
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
                      {formatDividend(item.cash_dividend)}
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
                    {isFirstOfGroup && (
                      <td
                        rowSpan={rowSpanCount}
                        className="px-2 py-2 font-medium whitespace-nowrap text-center align-middle bg-white/50"
                      >
                        {totalYield > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
                              {formatDividend(totalYield)}%
                            </span>
                            {rowSpanCount > 1 && (
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                (合計)
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}
                    <td className="px-2 py-2 text-slate-400 whitespace-nowrap text-center">
                      {item.days_to_fill && item.days_to_fill > 0 ? (
                        <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {item.days_to_fill} 天
                        </span>
                      ) : (
                        "-"
                      )}
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
