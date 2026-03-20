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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div
            key={day}
            className="py-2 md:py-4 text-center text-xs md:text-sm font-medium text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr">
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
              className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-b border-r border-slate-100 transition-all relative ${
                !isCurrentMonth ? "bg-slate-50 text-slate-400" : "bg-white"
              } ${
                dayDividends.length > 0
                  ? "cursor-pointer hover:bg-blue-50/50"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full ${
                    isToday ? "bg-blue-600 text-white" : "text-slate-700"
                  }`}
                >
                  {format(day, "d")}
                </span>

                <div className="flex items-center gap-1">
                  {hasTrackedStock && (
                    <Heart size={14} className="fill-rose-500 text-rose-500" />
                  )}
                  {dayDividends.length > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1 md:px-2 py-0.5 rounded-full">
                      <span className="hidden md:inline">
                        {dayDividends.length} 家
                      </span>
                      <span className="inline md:hidden">●</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden md:block space-y-1">
                {dayDividends.slice(0, 3).map((div) => (
                  <div
                    key={div.id}
                    className="text-xs truncate text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50 flex justify-between items-center"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStockSelect(div.stock_code);
                      }}
                      className="flex items-center gap-1 text-left"
                    >
                      {watchlistSet.has(div.stock_code) && (
                        <span className="text-rose-500 text-[10px]">♥</span>
                      )}
                      <span>
                        {div.stock_code} {div.stock_name}
                      </span>
                    </button>
                    {div.yield_rate > 0 && (
                      <span
                        className={`text-[10px] ml-1 ${
                          div.yield_rate >= localYield
                            ? "text-amber-600 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {div.yield_rate}%
                      </span>
                    )}
                  </div>
                ))}
                {dayDividends.length > 3 && (
                  <div className="text-xs text-slate-400 pl-1">
                    還有 {dayDividends.length - 3} 家...
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
