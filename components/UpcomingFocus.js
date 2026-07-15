"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import { Hourglass, Banknote, Heart, ChevronDown } from "lucide-react";
import { getDividendType } from "../lib/dividendEvent";

const MAX_ITEMS = 5; // 展開後每欄上限
const STRIP_ITEMS = 3; // 收合時單行顯示幾筆

// 除息日前一「交易日」(僅排除週末；國定假日以最近平日估算)
function lastBuyDate(exDateStr) {
  const d = parseISO(exDateStr);
  do {
    d.setDate(d.getDate() - 1);
  } while (d.getDay() === 0 || d.getDay() === 6);
  return d;
}

function countdownLabel(days) {
  if (days < 0) return null;
  if (days === 0) return "今天";
  if (days === 1) return "明天";
  return `${days} 天後`;
}

function countdownTone(days) {
  if (days <= 1) return "border-rose-200 bg-rose-50 text-rose-600";
  if (days <= 3) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function updatedAtLabel(updatedAt) {
  if (!updatedAt) return "更新時間未提供";
  const parsed = parseISO(updatedAt);
  if (Number.isNaN(parsed.getTime())) return "更新時間未提供";
  return `更新 ${format(parsed, "M/d HH:mm")}`;
}

// 自選股優先，其次按日期近的排前面
function prioritize(entries, watchlistSet) {
  return [...entries].sort((a, b) => {
    const aTracked = watchlistSet.has(a.item.stock_code) ? 0 : 1;
    const bTracked = watchlistSet.has(b.item.stock_code) ? 0 : 1;
    if (aTracked !== bTracked) return aTracked - bTracked;
    return a.days - b.days;
  });
}

// 收合時的單一膠囊 (靜態、可點)
function FocusPill({ entry, tracked, onStockClick }) {
  const { item, days, kind } = entry;
  const label = countdownLabel(days);
  const KindIcon = kind === "ex" ? Hourglass : Banknote;
  const kindTone = kind === "ex" ? "text-amber-500" : "text-emerald-600";

  return (
    <button
      type="button"
      onClick={() => onStockClick(item.stock_code)}
      title={kind === "ex" ? "最後買進倒數" : "即將入帳"}
      className="flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    >
      <span
        className={`rounded border px-1.5 py-0.5 text-[11px] font-black ${countdownTone(days)}`}
      >
        {label}
      </span>
      <span className="font-mono text-sm font-bold text-slate-800">
        {item.stock_code}
      </span>
      <span className="max-w-[6.5rem] truncate text-sm text-slate-600">
        {item.stock_name}
      </span>
      <KindIcon size={13} className={`flex-shrink-0 ${kindTone}`} />
      {tracked && (
        <Heart size={11} className="flex-shrink-0 fill-rose-500 text-rose-500" />
      )}
    </button>
  );
}

// 展開後的完整列 (含金額)
function FocusRow({ item, dateObj, days, tracked, amountLabel, onStockClick }) {
  const label = countdownLabel(days);
  if (label === null) return null;

  return (
    <button
      type="button"
      onClick={() => onStockClick(item.stock_code)}
      className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`w-14 flex-shrink-0 rounded border px-1 py-0.5 text-center text-[11px] font-black ${countdownTone(days)}`}
        >
          {label}
        </span>
        <span className="font-mono text-sm font-bold text-slate-800">
          {item.stock_code}
        </span>
        <span className="truncate text-sm text-slate-600">{item.stock_name}</span>
        {tracked && (
          <Heart size={12} className="flex-shrink-0 fill-rose-500 text-rose-500" />
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-xs font-bold text-slate-700">{amountLabel}</div>
        <div className="text-[10px] text-slate-400">{format(dateObj, "M/d")}</div>
      </div>
    </button>
  );
}

export default function UpcomingFocus({ watchlistSet, onStockClick }) {
  const { data } = useSWR("api/dividends/upcoming?days=30");
  const [expanded, setExpanded] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const exItems = useMemo(() => {
    if (!data?.ex_soon) return [];
    return data.ex_soon
      .map((item) => {
        const buyDate = lastBuyDate(item.ex_date);
        return {
          kind: "ex",
          item,
          dateObj: buyDate,
          days: differenceInCalendarDays(buyDate, today),
        };
      })
      .filter(({ days }) => days >= 0);
  }, [data, today]);

  const payItems = useMemo(() => {
    if (!data?.pay_soon) return [];
    return data.pay_soon.map((item) => ({
      kind: "pay",
      item,
      dateObj: parseISO(item.pay_date),
      days: differenceInCalendarDays(parseISO(item.pay_date), today),
    }));
  }, [data, today]);

  // 收合單行：除息與發息混在一起，自選優先、再按倒數近的，取前 STRIP_ITEMS 筆
  const stripItems = useMemo(
    () => prioritize([...exItems, ...payItems], watchlistSet).slice(0, STRIP_ITEMS),
    [exItems, payItems, watchlistSet]
  );

  // 展開兩欄各自排序
  const exSorted = useMemo(
    () => prioritize(exItems, watchlistSet).slice(0, MAX_ITEMS),
    [exItems, watchlistSet]
  );
  const paySorted = useMemo(
    () => prioritize(payItems, watchlistSet).slice(0, MAX_ITEMS),
    [payItems, watchlistSet]
  );

  if (!data || (exItems.length === 0 && payItems.length === 0)) return null;

  const hasWatchlist = watchlistSet.size > 0;

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 md:px-4">
      {/* 收合單行：近期重點 */}
      <div className="flex items-center gap-2">
        <div className="flex flex-shrink-0 flex-col">
          <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
            <Hourglass size={15} className="text-amber-500" aria-hidden="true" />
            近期重點
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {updatedAtLabel(data.updated_at)}
          </span>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex items-center gap-2">
            {stripItems.map((entry) => (
              <FocusPill
                key={`${entry.kind}-${entry.item.stock_code}-${entry.item.ex_date}`}
                entry={entry}
                tracked={watchlistSet.has(entry.item.stock_code)}
                onStockClick={onStockClick}
              />
            ))}
            {!hasWatchlist && (
              <span className="flex-shrink-0 whitespace-nowrap text-xs text-slate-400">
                · 追蹤 ♥ 後這裡優先顯示你的
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-h-11 flex-shrink-0 items-center gap-0.5 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          {expanded ? "收合" : "查看全部"}
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* 展開：完整兩欄 */}
      {expanded && (
        <div className="mt-3 grid gap-4 border-t border-slate-100 pt-3 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-900">
              <Hourglass size={14} className="text-amber-500" />
              最後買進倒數
              <span className="text-[10px] font-normal text-slate-400">
                (除權息前一交易日 · 週末順延估算)
              </span>
            </h3>
            <div className="mt-2 space-y-1.5">
              {exSorted.length === 0 ? (
                <p className="py-3 text-center text-xs text-slate-400">
                  近期沒有即將除權息的股票
                </p>
              ) : (
                exSorted.map(({ item, dateObj, days }) => (
                  <FocusRow
                    key={`ex-${item.stock_code}-${item.ex_date}`}
                    item={item}
                    dateObj={dateObj}
                    days={days}
                    tracked={watchlistSet.has(item.stock_code)}
                    amountLabel={
                      getDividendType(item) === "stock"
                        ? `配股 ${Number(item.stock_dividend || 0)}`
                        : `配 ${Number(item.cash_dividend || 0)} 元`
                    }
                    onStockClick={onStockClick}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-900">
              <Banknote size={14} className="text-emerald-600" />
              即將入帳
            </h3>
            <div className="mt-2 space-y-1.5">
              {paySorted.length === 0 ? (
                <p className="py-3 text-center text-xs text-slate-400">
                  近期沒有即將發放的股利
                </p>
              ) : (
                paySorted.map(({ item, dateObj, days }) => (
                  <FocusRow
                    key={`pay-${item.stock_code}-${item.pay_date}`}
                    item={item}
                    dateObj={dateObj}
                    days={days}
                    tracked={watchlistSet.has(item.stock_code)}
                    amountLabel={`$${Number(item.cash_dividend || 0)}/股`}
                    onStockClick={onStockClick}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
