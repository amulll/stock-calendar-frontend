"use client";

import { format, isSameDay } from "date-fns";
import { Heart } from "lucide-react";

const DEFAULT_SHARES = 1000;
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function formatMoney(value) {
  return "$" + Math.round(value).toLocaleString("en-US");
}

// 月曆的清單視圖：只列有股利的日期，適合手機瀏覽
export default function AgendaList({
  monthDays,
  dividendsByDate,
  watchlistSet,
  onStockSelect,
  showAmounts = false,
  sharesMap = {},
}) {
  const amountOf = (div) =>
    (Number(div.cash_dividend) || 0) *
    Number(sharesMap[div.stock_code] ?? DEFAULT_SHARES);

  const daysWithData = monthDays.filter(
    (day) => (dividendsByDate.get(format(day, "yyyy-MM-dd")) || []).length > 0
  );

  if (daysWithData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-400">
        本月沒有符合條件的股利發放
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {daysWithData.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayDividends = dividendsByDate.get(key) || [];
        const isToday = isSameDay(day, new Date());
        const dayTotal = dayDividends.reduce((sum, div) => sum + amountOf(div), 0);

        return (
          <div
            key={key}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div
              className={`flex items-center justify-between border-b border-slate-100 px-3 py-2 ${
                isToday ? "bg-blue-50" : "bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-black ${
                    isToday ? "text-blue-700" : "text-slate-800"
                  }`}
                >
                  {format(day, "M/d")}（{WEEKDAYS[day.getDay()]}）
                  {isToday && " · 今天"}
                </span>
                <span className="text-xs text-slate-400">
                  {dayDividends.length} 檔
                </span>
              </div>
              {showAmounts && dayTotal > 0 && (
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-black text-white">
                  {formatMoney(dayTotal)}
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-50">
              {dayDividends.map((div) => (
                <button
                  key={div.id}
                  type="button"
                  onClick={() => onStockSelect(div.stock_code)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {watchlistSet.has(div.stock_code) && (
                      <Heart
                        size={12}
                        className="flex-shrink-0 fill-rose-500 text-rose-500"
                      />
                    )}
                    <span className="font-mono text-sm font-bold text-slate-800">
                      {div.stock_code}
                    </span>
                    <span className="truncate text-sm text-slate-600">
                      {div.stock_name}
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-sm font-bold text-slate-700">
                    {showAmounts
                      ? `+${formatMoney(amountOf(div))}`
                      : Number(div.cash_dividend) > 0
                      ? `${Number(div.cash_dividend)} 元`
                      : Number(div.stock_dividend) > 0
                      ? `配股 ${Number(div.stock_dividend)}`
                      : "未公告"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
