"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import PortfolioModal from "../PortfolioModal";
import { useToast } from "../../hooks/useToast";
import { useWatchlist } from "../../hooks/useWatchlist";
import { trackEvent } from "../../lib/analytics";

const SAMPLE_WATCHLIST = ["0056", "00878", "2330"];

export default function PortfolioWorkspace() {
  const router = useRouter();
  const { addToast } = useToast();
  const trackedEditsRef = useRef(new Set());
  const trackedOpenRef = useRef(false);
  const {
    watchlist,
    sharesMap,
    costMap,
    watchlistSet,
    toggleWatchlist,
    updateShares,
    updateCost,
    exportData,
    importData,
    hydrated,
    storageAvailable,
  } = useWatchlist();

  useEffect(() => {
    if (!hydrated || trackedOpenRef.current) return;
    trackedOpenRef.current = true;
    trackEvent("portfolio_view", {
      source: "portfolio_page",
      surface: "page",
      has_watchlist: watchlist.length > 0,
    });
  }, [hydrated, watchlist.length]);

  const trackEditOnce = (field) => {
    if (trackedEditsRef.current.has(field)) return;
    trackedEditsRef.current.add(field);
    trackEvent("portfolio_value_edit", { field, source: "portfolio_page" });
  };

  const addSampleWatchlist = () => {
    const missingCodes = SAMPLE_WATCHLIST.filter(
      (code) => !watchlistSet.has(code)
    );
    missingCodes.forEach(toggleWatchlist);
    if (missingCodes.length > 0) {
      trackEvent("sample_watchlist_add", { source: "portfolio_page" });
      addToast(`已加入 ${missingCodes.length} 檔範例自選`, "success");
    }
  };

  if (!hydrated) {
    return (
      <div
        className="flex min-h-[28rem] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500"
        role="status"
      >
        <Loader2 className="mr-2 animate-spin" size={18} aria-hidden="true" />
        讀取此裝置的存股資料…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!storageAvailable && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
          role="alert"
        >
          瀏覽器儲存空間目前不可用。你仍可查看本次頁面狀態，但重新整理後可能無法保留變更。
        </div>
      )}
      <PortfolioModal
        variant="page"
        watchlist={watchlist}
        sharesMap={sharesMap}
        onSharesChange={(code, value) => {
          updateShares(code, value);
          trackEditOnce("shares");
        }}
        costMap={costMap}
        onCostChange={(code, value) => {
          updateCost(code, value);
          trackEditOnce("cost");
        }}
        onExportData={exportData}
        onImportData={importData}
        onAddSampleWatchlist={addSampleWatchlist}
        onStockClick={(code) => {
          trackEvent("stock_detail_open", { source: "portfolio_page" });
          router.push(`/stock/${code}`);
        }}
      />
    </div>
  );
}
