"use client";

import Link from "next/link";
import { ListFilter } from "lucide-react";

// 首頁精簡摘要：價值說明 + 自選股試算入口；月份與筆數統一留在月曆工具列。
export default function CalendarSummary({
  watchlistCount,
  watchlistHydrated,
  onOpenPortfolio,
  onAddSampleWatchlist,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">台股股利發放日曆</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 md:text-2xl">
          查股利何時入帳，算出今年能領多少
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
          追蹤持股，整理股利入帳日、近期除權息與組合領息試算。
          <Link
            href="/screener"
            className="ml-2 inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:underline"
          >
            <ListFilter size={14} aria-hidden="true" />
            存股選股表 →
          </Link>
        </p>
      </div>

      {!watchlistHydrated ? (
        <div
          className="h-16 w-full animate-pulse rounded-lg border border-slate-200 bg-slate-100 lg:w-[180px]"
          role="status"
          aria-label="讀取自選股"
        />
      ) : watchlistCount === 0 ? (
        <div className="flex flex-col items-start gap-1 lg:flex-shrink-0 lg:items-end">
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
      ) : (
        <button
          type="button"
          onClick={onOpenPortfolio}
          className="group min-h-11 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:min-w-[180px] lg:flex-shrink-0"
          title="試算自選股年領股息"
        >
          <p className="flex items-center justify-between gap-3 text-[11px] font-semibold text-emerald-700">
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
      )}
    </div>
  );
}
