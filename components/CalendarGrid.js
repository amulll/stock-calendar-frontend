"use client";

import { format, isSameDay, isSameMonth } from "date-fns";
import { Heart } from "lucide-react";

const DEFAULT_SHARES = 1000;

function formatMoney(value) {
  return "$" + Math.round(value).toLocaleString("en-US");
}

export default function CalendarGrid({
  calendarDays,
  monthStart,
  watchlistSet,
  dividendsByDate,
  onDateSelect,
  onStockSelect,
  localYield,
  showAmounts = false,
  sharesMap = {},
}) {
  // 自選模式下：入帳金額 = 現金股利 × 使用者設定的持有股數 (未設定以 1 張計)
  const amountOf = (div) =>
    (Number(div.cash_dividend) || 0) *
    Number(sharesMap[div.stock_code] ?? DEFAULT_SHARES);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-1.5 md:p-2">
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div
            key={day}
            className="bg-slate-50 py-2 text-center text-[11px] font-bold text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 auto-rows-fr gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
        {calendarDays.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayDividends = dividendsByDate.get(dayKey) || [];
          const isInteractive = dayDividends.length > 0;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const hasTrackedStock = dayDividends.some((div) =>
            watchlistSet.has(div.stock_code)
          );

          const handleDayActivate = () => {
            if (isInteractive) {
              onDateSelect(day);
            }
          };
          const dayButtonLabel = `${format(day, "M月d日")}有 ${dayDividends.length} 檔股利，按 Enter 查看詳細清單`;

          return (
            <div
              key={day.toISOString()}
              onClick={handleDayActivate}
              className={`group relative min-h-[76px] p-1.5 transition-colors md:min-h-[132px] md:p-2 ${
                !isCurrentMonth
                  ? "bg-slate-50 text-slate-300"
                  : "bg-white"
              } ${
                isInteractive
                  ? "cursor-pointer hover:bg-blue-50/50"
                  : ""
              }`}
            >
              <div className="mb-1.5 flex items-start justify-between">
                {isInteractive ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDayActivate();
                    }}
                    aria-label={dayButtonLabel}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 md:h-8 md:w-8 md:text-sm ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-blue-50"
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                ) : (
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-black md:h-8 md:w-8 md:text-sm ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-slate-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {hasTrackedStock && (
                    <span className="rounded bg-rose-50 p-1 text-rose-500">
                      <Heart size={12} className="fill-rose-500 text-rose-500" />
                    </span>
                  )}
                  {dayDividends.length > 0 &&
                    (showAmounts ? (
                      // 自選模式：直接顯示「當天我的入帳金額」
                      <span className="max-w-full truncate rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                        {formatMoney(
                          dayDividends.reduce((sum, div) => sum + amountOf(div), 0)
                        )}
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
                        <span className="hidden md:inline">
                          {dayDividends.length} 檔
                        </span>
                        <span className="inline md:hidden">●</span>
                      </span>
                    ))}
                </div>
              </div>

              <div className="hidden space-y-0.5 md:block">
                {dayDividends.slice(0, 3).map((div) => (
                  <div
                    key={div.id}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-600 transition group-hover:border-blue-100"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStockSelect(div.stock_code);
                      }}
                      className="flex min-w-0 items-center gap-1 text-left"
                    >
                      {watchlistSet.has(div.stock_code) && (
                        <span className="text-rose-500 text-[10px]">♥</span>
                      )}
                      <span className="font-mono font-semibold text-slate-700">
                        {div.stock_code}
                      </span>
                      <span className="truncate text-slate-500">
                        {div.stock_name}
                      </span>
                    </button>
                    {showAmounts ? (
                      Number(div.cash_dividend) > 0 ? (
                        <span className="ml-1 whitespace-nowrap rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
                          +{formatMoney(amountOf(div))}
                        </span>
                      ) : (
                        // 純配股：現金入帳為 0，標示配股避免顯示 +$0
                        <span className="ml-1 whitespace-nowrap rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-black text-blue-600">
                          {Number(div.stock_dividend) > 0 ? "配股" : "--"}
                        </span>
                      )
                    ) : (
                      <span
                        className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-black ${
                          div.yield_rate > 0
                            ? div.yield_rate >= localYield
                              ? "bg-amber-50 text-amber-600"
                              : "bg-white text-slate-400"
                            : "bg-white text-slate-300"
                        }`}
                      >
                        {div.yield_rate > 0 ? `${div.yield_rate}%` : "--"}
                      </span>
                    )}
                  </div>
                ))}
                {dayDividends.length > 3 && (
                  <div className="pl-1 text-xs font-medium text-slate-400">
                    還有 {dayDividends.length - 3} 檔...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
