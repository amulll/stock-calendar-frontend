"use client";

import Link from "next/link";
import { Heart, Loader2, Wallet } from "lucide-react";

import { useWatchlist } from "../../hooks/useWatchlist";
import { trackEvent } from "../../lib/analytics";

export default function StockWatchlistActions({ stockCode, stockName }) {
  const {
    watchlistSet,
    toggleWatchlist,
    hydrated,
    storageAvailable,
  } = useWatchlist();

  if (!hydrated) {
    return (
      <div
        className="flex min-h-11 items-center gap-2 text-sm text-slate-500"
        role="status"
      >
        <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        讀取此裝置的自選股…
      </div>
    );
  }

  const tracked = watchlistSet.has(stockCode);
  const label = tracked ? "移出自選股" : "加入自選股";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={!storageAvailable}
        onClick={() => {
          toggleWatchlist(stockCode);
          trackEvent(tracked ? "watchlist_remove" : "watchlist_add", {
            source: "stock_page",
          });
        }}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          tracked
            ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            : "border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
        }`}
        aria-label={`${label}：${stockName} (${stockCode})`}
        aria-pressed={tracked}
      >
        <Heart
          size={18}
          className={tracked ? "fill-rose-500 text-rose-500" : ""}
          aria-hidden="true"
        />
        {tracked ? "已加入自選" : "加入自選"}
      </button>

      {tracked && (
        <Link
          href="/portfolio"
          onClick={() =>
            trackEvent("portfolio_cta_click", { source: "stock_page" })
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
        >
          <Wallet size={18} aria-hidden="true" />
          前往存股組合
        </Link>
      )}

      {!storageAvailable && (
        <p className="w-full text-xs leading-5 text-rose-600" role="alert">
          瀏覽器儲存空間目前不可用，無法在此裝置保存自選股。
        </p>
      )}
    </div>
  );
}
