"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { ChevronDown, Heart } from "lucide-react";

const DEFAULT_SHARES = 1000;
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function formatMoney(value) {
  return "$" + Math.round(value).toLocaleString("en-US");
}

// 月曆的清單視圖：按日期收合，只展開使用者目前查看的單一日期。
export default function AgendaList({
  monthDays,
  dividendsByDate,
  watchlistSet,
  onStockSelect,
  showAmounts = false,
  sharesMap = {},
  isCurrentMonth = false,
}) {
  const amountOf = (div) =>
    (Number(div.cash_dividend) || 0) *
    Number(sharesMap[div.stock_code] ?? DEFAULT_SHARES);

  const targetRef = useRef(null);
  const lastScrolledMonthRef = useRef(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const daysWithData = useMemo(
    () =>
      monthDays.filter(
        (day) => (dividendsByDate.get(format(day, "yyyy-MM-dd")) || []).length > 0
      ),
    [monthDays, dividendsByDate]
  );
  const monthKey = monthDays[0] ? format(monthDays[0], "yyyy-MM") : null;
  const availableKeySignature = daysWithData
    .map((day) => format(day, "yyyy-MM-dd"))
    .join("|");
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const targetKey = isCurrentMonth
    ? daysWithData
        .map((day) => format(day, "yyyy-MM-dd"))
        .find((dayKey) => dayKey >= todayKey) || null
    : null;

  useEffect(() => {
    setExpandedKey((currentKey) =>
      currentKey && availableKeySignature.split("|").includes(currentKey)
        ? currentKey
        : null
    );
  }, [monthKey, availableKeySignature]);

  useEffect(() => {
    if (!isCurrentMonth) {
      lastScrolledMonthRef.current = null;
      return undefined;
    }
    if (!targetKey || !monthKey || lastScrolledMonthRef.current === monthKey) {
      return undefined;
    }
    if (!window.matchMedia("(max-width: 768px)").matches) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      targetRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      lastScrolledMonthRef.current = monthKey;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isCurrentMonth, monthKey, targetKey]);

  if (daysWithData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-400">
        本月沒有符合條件的股利發放
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {daysWithData.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayDividends = dividendsByDate.get(key) || [];
        const isToday = isSameDay(day, new Date());
        const dayTotal = dayDividends.reduce((sum, div) => sum + amountOf(div), 0);
        const isExpanded = expandedKey === key;
        const panelId = `agenda-day-${key}`;

        return (
          <div
            key={key}
            ref={key === targetKey ? targetRef : undefined}
            className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedKey((currentKey) =>
                  currentKey === key ? null : key
                )
              }
              className={`flex min-h-11 w-full touch-manipulation items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300 ${
                isToday ? "bg-blue-50" : "bg-slate-50"
              } ${isExpanded ? "border-b border-slate-100" : ""}`}
              aria-expanded={isExpanded}
              aria-controls={isExpanded ? panelId : undefined}
            >
              <div className="flex min-w-0 items-center gap-2">
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
              <span className="flex flex-shrink-0 items-center gap-2">
                {showAmounts && dayTotal > 0 && (
                  <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-black text-white">
                    {formatMoney(dayTotal)}
                  </span>
                )}
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </span>
            </button>

            {isExpanded && (
              <div id={panelId} className="divide-y divide-slate-50">
                {dayDividends.map((div) => (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => onStockSelect(div.stock_code)}
                    className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {watchlistSet.has(div.stock_code) && (
                        <Heart
                          size={12}
                          className="flex-shrink-0 fill-rose-500 text-rose-500"
                          aria-hidden="true"
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
            )}
          </div>
        );
      })}
    </div>
  );
}
