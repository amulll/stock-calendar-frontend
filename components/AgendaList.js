"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { ChevronDown, Heart } from "lucide-react";

const DEFAULT_SHARES = 1000;
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function formatMoney(value) {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function formatDividend(value) {
  return Number(value || 0).toLocaleString("zh-TW", {
    maximumFractionDigits: 3,
  });
}

function getDividendLabels(div, showAmounts, amount) {
  const cash = Number(div.cash_dividend) || 0;
  const stock = Number(div.stock_dividend) || 0;
  const yieldRate = Number(div.yield_rate) || 0;

  if (showAmounts && cash > 0) {
    return {
      primary: `+${formatMoney(amount)}`,
      secondary:
        stock > 0
          ? `每股 ${formatDividend(cash)} 元 · 配股 ${formatDividend(stock)}`
          : `每股現金 ${formatDividend(cash)} 元`,
    };
  }
  if (cash > 0) {
    return {
      primary: `${formatDividend(cash)} 元`,
      secondary:
        stock > 0
          ? `另配股 ${formatDividend(stock)}`
          : yieldRate > 0
          ? `殖利率 ${formatDividend(yieldRate)}%`
          : "每股現金股利",
    };
  }
  if (stock > 0) {
    return {
      primary: `配股 ${formatDividend(stock)}`,
      secondary: "股票股利",
    };
  }
  return { primary: "未公告", secondary: "股利資料待更新" };
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      {daysWithData.map((day, dayIndex) => {
        const key = format(day, "yyyy-MM-dd");
        const dayDividends = dividendsByDate.get(key) || [];
        const isToday = isSameDay(day, new Date());
        const dayTotal = dayDividends.reduce((sum, div) => sum + amountOf(div), 0);
        const watchlistCount = dayDividends.filter((div) =>
          watchlistSet.has(div.stock_code)
        ).length;
        const isExpanded = expandedKey === key;
        const panelId = `agenda-day-${key}`;
        const triggerId = `agenda-trigger-${key}`;

        return (
          <div
            key={key}
            ref={key === targetKey ? targetRef : undefined}
            className={`scroll-mt-24 ${
              dayIndex < daysWithData.length - 1 ? "border-b border-slate-200" : ""
            }`}
          >
            <button
              id={triggerId}
              type="button"
              onClick={() =>
                setExpandedKey((currentKey) =>
                  currentKey === key ? null : key
                )
              }
              className={`flex min-h-[68px] w-full touch-manipulation items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 motion-reduce:transition-none md:px-4 ${
                isToday ? "bg-blue-50/80" : "bg-white"
              } ${isExpanded ? "bg-slate-50" : ""}`}
              aria-expanded={isExpanded}
              aria-controls={isExpanded ? panelId : undefined}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg border leading-none ${
                    isToday
                      ? "border-blue-200 bg-white text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                  aria-hidden="true"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    {format(day, "M月")}
                  </span>
                  <span className="mt-0.5 text-xl font-black">{format(day, "d")}</span>
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-sm font-black md:text-base ${
                        isToday ? "text-blue-800" : "text-slate-900"
                      }`}
                    >
                      <span className="sr-only">
                        {format(day, "yyyy年M月d日")}，
                      </span>
                      星期{WEEKDAYS[day.getDay()]}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        今天
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block truncate text-xs font-medium text-slate-500">
                    {dayDividends.length} 筆股利發放
                    {watchlistCount > 0 && ` · ${watchlistCount} 筆自選股`}
                  </span>
                </span>
              </div>
              <span className="flex flex-shrink-0 items-center gap-2 md:gap-3">
                {showAmounts && dayTotal > 0 && (
                  <span className="text-right">
                    <span className="block text-[10px] font-semibold text-slate-500">
                      預估入帳
                    </span>
                    <span className="block text-sm font-black text-emerald-700">
                      {formatMoney(dayTotal)}
                    </span>
                  </span>
                )}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                  <ChevronDown
                    size={18}
                    className={`text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </span>
            </button>

            {isExpanded && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="divide-y divide-slate-100 border-t border-slate-200 bg-slate-50/40"
              >
                {dayDividends.map((div) => {
                  const isWatchlisted = watchlistSet.has(div.stock_code);
                  const labels = getDividendLabels(
                    div,
                    showAmounts,
                    amountOf(div)
                  );

                  return (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => onStockSelect(div.stock_code)}
                      className="grid min-h-[60px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 motion-reduce:transition-none md:px-4 md:pl-[4.75rem]"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs font-black text-slate-700">
                            {div.stock_code}
                          </span>
                          {isWatchlisted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                              <Heart
                                size={10}
                                className="fill-current"
                                aria-hidden="true"
                              />
                              自選
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block truncate text-sm font-semibold text-slate-700">
                          {div.stock_name}
                        </span>
                      </span>
                      <span className="flex-shrink-0 whitespace-nowrap text-right">
                        <span
                          className={`block text-sm font-black ${
                            showAmounts && Number(div.cash_dividend) > 0
                              ? "text-emerald-700"
                              : "text-slate-800"
                          }`}
                        >
                          {labels.primary}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                          {labels.secondary}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
