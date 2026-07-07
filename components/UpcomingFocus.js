"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import { Hourglass, Banknote, Heart } from "lucide-react";

const MAX_ITEMS = 5;

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

// 自選股優先，其次按日期近的排前面，最多取 MAX_ITEMS
function prioritize(items, watchlistSet, getDate) {
  return [...items]
    .sort((a, b) => {
      const aTracked = watchlistSet.has(a.stock_code) ? 0 : 1;
      const bTracked = watchlistSet.has(b.stock_code) ? 0 : 1;
      if (aTracked !== bTracked) return aTracked - bTracked;
      return new Date(getDate(a)) - new Date(getDate(b));
    })
    .slice(0, MAX_ITEMS);
}

function FocusRow({ item, dateObj, days, tracked, amountLabel, onStockClick }) {
  const label = countdownLabel(days);
  if (label === null) return null;

  return (
    <button
      type="button"
      onClick={() => onStockClick(item.stock_code)}
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
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

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const exItems = useMemo(() => {
    if (!data?.ex_soon) return [];
    return prioritize(data.ex_soon, watchlistSet, (d) => d.ex_date)
      .map((item) => {
        const buyDate = lastBuyDate(item.ex_date);
        return {
          item,
          dateObj: buyDate,
          days: differenceInCalendarDays(buyDate, today),
        };
      })
      .filter(({ days }) => days >= 0);
  }, [data, watchlistSet, today]);

  const payItems = useMemo(() => {
    if (!data?.pay_soon) return [];
    return prioritize(data.pay_soon, watchlistSet, (d) => d.pay_date).map(
      (item) => ({
        item,
        dateObj: parseISO(item.pay_date),
        days: differenceInCalendarDays(parseISO(item.pay_date), today),
      })
    );
  }, [data, watchlistSet, today]);

  if (!data || (exItems.length === 0 && payItems.length === 0)) return null;

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3 md:p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-black text-slate-900">
            <Hourglass size={15} className="text-amber-500" />
            最後買進倒數
            <span className="text-[10px] font-normal text-slate-400">
              (除息前一交易日 · 週末順延估算)
            </span>
          </h2>
          <div className="mt-2 space-y-1.5">
            {exItems.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-400">
                近期沒有即將除息的股票
              </p>
            ) : (
              exItems.map(({ item, dateObj, days }) => (
                <FocusRow
                  key={`ex-${item.stock_code}-${item.ex_date}`}
                  item={item}
                  dateObj={dateObj}
                  days={days}
                  tracked={watchlistSet.has(item.stock_code)}
                  amountLabel={`配 ${Number(item.cash_dividend || 0)} 元`}
                  onStockClick={onStockClick}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-black text-slate-900">
            <Banknote size={15} className="text-emerald-600" />
            即將入帳
          </h2>
          <div className="mt-2 space-y-1.5">
            {payItems.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-400">
                近期沒有即將發放的股利
              </p>
            ) : (
              payItems.map(({ item, dateObj, days }) => (
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

      {data.updated_at && (
        <p className="mt-3 border-t border-slate-100 pt-2 text-right text-[10px] text-slate-400">
          資料更新於 {format(parseISO(data.updated_at), "M/d HH:mm")}
        </p>
      )}
    </section>
  );
}
