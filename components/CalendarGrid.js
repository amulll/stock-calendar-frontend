"use client";

import { format, isSameDay, isSameMonth } from "date-fns";
import { Heart } from "lucide-react";

export default function CalendarGrid({
  calendarDays,
  monthStart,
  watchlistSet,
  dividendsByDate,
  onDateSelect,
  onStockSelect,
  localYield,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:p-3">
      <div className="grid grid-cols-7 gap-1 rounded-xl bg-slate-100 p-1 md:gap-1.5 md:p-1.5">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div
            key={day}
            className="rounded-lg bg-white py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 md:py-2.5"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 auto-rows-fr gap-1 md:gap-1.5">
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
              className={`group relative min-h-[84px] rounded-xl border p-1.5 transition-all md:min-h-[140px] md:p-2 ${
                !isCurrentMonth
                  ? "border-slate-100 bg-slate-50/80 text-slate-300"
                  : "border-slate-200 bg-white"
              } ${
                isInteractive
                  ? "cursor-pointer hover:border-blue-200 hover:bg-blue-50/60"
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
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 md:h-8 md:w-8 md:text-sm ${
                      isToday
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-blue-50"
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                ) : (
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black md:h-8 md:w-8 md:text-sm ${
                      isToday
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {hasTrackedStock && (
                    <span className="rounded-full bg-rose-50 p-1 text-rose-500">
                      <Heart size={12} className="fill-rose-500 text-rose-500" />
                    </span>
                  )}
                  {dayDividends.length > 0 && (
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                      <span className="hidden md:inline">
                        {dayDividends.length} 檔
                      </span>
                      <span className="inline md:hidden">●</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden md:block space-y-0.5">
                {dayDividends.slice(0, 3).map((div) => (
                  <div
                    key={div.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs text-slate-600 transition group-hover:border-blue-100"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStockSelect(div.stock_code);
                      }}
                      className="flex min-w-0 items-center gap-0.5 text-left"
                    >
                      {watchlistSet.has(div.stock_code) && (
                        <span className="text-rose-500 text-[10px]">♥</span>
                      )}
                      <span className="truncate">
                        {div.stock_code} {div.stock_name}
                      </span>
                    </button>
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        div.yield_rate > 0
                          ? div.yield_rate >= localYield
                            ? "bg-amber-50 text-amber-600"
                            : "bg-white text-slate-400"
                          : "bg-white text-slate-300"
                      }`}
                    >
                      {div.yield_rate > 0 ? `${div.yield_rate}%` : "--"}
                    </span>
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
