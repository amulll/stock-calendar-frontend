"use client";

import { format } from "date-fns";

// 日曆頂部：標題 + 月份/符合筆數/自選股統計卡 (自選股卡即存股儀表板入口)
export default function CalendarSummary({
  currentDate,
  filteredCount,
  watchlistCount,
  onOpenPortfolio,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        <p className="text-xs font-semibold text-slate-500">台股股利日曆</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
          股利工作區
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          搜尋股票、切換月份、篩選自選與高殖利率，集中在同一個資料視圖。
        </p>
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
