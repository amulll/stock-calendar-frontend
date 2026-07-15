"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Heart, Lightbulb, ListFilter } from "lucide-react";

// 日曆頂部：標題 + 月份/符合筆數/自選股統計卡 (自選股卡即存股儀表板入口)
export default function CalendarSummary({
  currentDate,
  filteredCount,
  watchlistCount,
  onOpenPortfolio,
  onAddSampleWatchlist,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        <p className="text-xs font-semibold text-slate-500">台股股利日曆</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
          查股利何時入帳，算出今年能領多少
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          追蹤持股，自動整理除權息、發放日與年度預估股息。
          <Link
            href="/screener"
            className="ml-2 inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:underline"
          >
            <ListFilter size={14} aria-hidden="true" />
            存股選股表 →
          </Link>
        </p>
        {watchlistCount === 0 && (
          <div className="mt-2 flex flex-col items-start gap-2">
            <p className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Lightbulb size={14} aria-hidden="true" />
              點股票旁的 <Heart size={13} aria-hidden="true" />
              <span className="sr-only">愛心</span>加入自選，即可試算年領股息
            </p>
            <button
              type="button"
              onClick={onAddSampleWatchlist}
              className="inline-flex min-h-11 items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-left text-sm font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              用熱門持股快速試算
            </button>
            <p className="text-xs font-medium text-slate-500">
              範例包含 0056、00878 與台積電（2330）
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[420px]">
        <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:col-span-1">
          <p className="text-[11px] font-semibold text-slate-500">目前月份</p>
          <p className="mt-1 whitespace-nowrap text-lg font-black tracking-tight text-slate-950">
            {format(currentDate, "yyyy年 M月")}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold text-slate-500">符合筆數</p>
          <p className="mt-1 text-lg font-black tracking-tight text-slate-950">
            {filteredCount}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPortfolio}
          className="group rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          title="試算自選股年領股息"
        >
          <p className="flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>我的自選股</span>
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white">
              {watchlistCount}
            </span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm font-black tracking-tight text-emerald-800">
            試算年領股息
            <span className="transition group-hover:translate-x-0.5">→</span>
          </p>
        </button>
      </div>
    </div>
  );
}
