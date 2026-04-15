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
    <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-2 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.4)] md:p-4">
      <div className="grid grid-cols-7 gap-1.5 rounded-[26px] bg-slate-100/80 p-1.5 md:gap-2 md:p-2">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div
            key={day}
            className="rounded-2xl bg-white/80 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 md:py-3"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 auto-rows-fr gap-1.5 md:gap-2">
        {calendarDays.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayDividends = dividendsByDate.get(dayKey) || [];
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const hasTrackedStock = dayDividends.some((div) =>
            watchlistSet.has(div.stock_code)
          );

          return (
            <div
              key={day.toISOString()}
              onClick={() => {
                if (dayDividends.length > 0) {
                  onDateSelect(day);
                }
              }}
              className={`group relative min-h-[84px] rounded-[24px] border p-1.5 transition-all md:min-h-[140px] md:p-2.5 ${
                !isCurrentMonth
                  ? "border-slate-100 bg-slate-50/80 text-slate-300"
                  : "border-slate-200/70 bg-white shadow-[0_16px_35px_-30px_rgba(15,23,42,0.35)]"
              } ${
                dayDividends.length > 0
                  ? "cursor-pointer hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60"
                  : ""
              }`}
            >
              <div className="mb-1.5 flex items-start justify-between">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black md:h-8 md:w-8 md:text-sm ${
                    isToday
                      ? "bg-blue-600 text-white shadow-[0_12px_25px_-18px_rgba(37,99,235,0.95)]"
                      : "text-slate-700"
                  }`}
                >
                  {format(day, "d")}
                </span>

                <div className="flex items-center gap-1">
                  {hasTrackedStock && (
                    <span className="rounded-full bg-rose-50 p-1 text-rose-500">
                      <Heart size={12} className="fill-rose-500 text-rose-500" />
                    </span>
                  )}
                  {dayDividends.length > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
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
                    className="flex items-center justify-between rounded-[14px] border border-slate-200/70 bg-slate-50/90 px-1.5 py-1 text-xs text-slate-600 transition group-hover:border-blue-100"
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
                    {div.yield_rate > 0 && (
                      <span
                        className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          div.yield_rate >= localYield
                            ? "bg-amber-50 text-amber-600"
                            : "bg-white text-slate-400"
                        }`}
                      >
                        {div.yield_rate}%
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
