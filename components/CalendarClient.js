"use client";

import SeoContent from "./SeoContent";
import { useState, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import DividendModal from "./DividendModal";
import StockModal from "./StockModal";
import WatchlistModal from "./WatchlistModal";
import YieldListModal from "./YieldListModal";
import PortfolioModal from "./PortfolioModal";
import AdUnit from "./AdUnit";
import Loading from "./Loading";
import FilterBar from "./FilterBar";
import CalendarGrid from "./CalendarGrid";
import CalendarSummary from "./CalendarSummary";
import AgendaList from "./AgendaList";
import UpcomingFocus from "./UpcomingFocus";
import { useCalendarQueryState } from "../hooks/useCalendarQueryState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useWatchlist } from "../hooks/useWatchlist";
import { proxyGet } from "../lib/proxy-client";
import { useToast } from "../hooks/useToast";
import { trackEvent } from "../lib/analytics";

const SAMPLE_WATCHLIST = ["0056", "00878", "2330"];
const VIEW_MODE_STORAGE_KEY = "calendarViewMode";

function CalendarViewPlaceholder() {
  return (
    <div
      className="min-h-[420px] animate-pulse rounded-xl border border-slate-200 bg-white p-3 motion-reduce:animate-none md:min-h-[640px]"
      role="status"
      aria-label="正在準備日曆檢視"
    >
      <div className="h-9 rounded-lg bg-slate-100" />
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-7">
        {Array.from({ length: 14 }).map((_, index) => (
          <div key={index} className="h-20 rounded-lg bg-slate-100 md:h-28" />
        ))}
      </div>
    </div>
  );
}

export default function CalendarClient({ initialDividends, initialAllStocks }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsString = searchParams.toString();

  const {
    currentDate,
    setCurrentDate,
    yieldThreshold,
    setYieldThreshold,
    showHighYieldOnly,
    setShowHighYieldOnly,
  } = useCalendarQueryState({ searchParams, router, pathname });

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
  } = useWatchlist();

  const [allStocks] = useState(initialAllStocks || []);
  const [jumpLoading, setJumpLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [viewMode, setViewMode] = useState(null); // null | "grid" | "list"
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [yieldListOpen, setYieldListOpen] = useState(false);
  const [localYield, setLocalYield] = useState(yieldThreshold);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const hasHandledJump = useRef(false);
  const trackedPortfolioEditsRef = useRef(new Set());
  const debouncedFilter = useDebouncedValue(filterText, 250);
  const { addToast } = useToast();

  // 月股利改由 SWR 管理：key 隨當前月份變動，首月沿用 SSR 預抓的 initialDividends
  const dividendsKey = `api/dividends?year=${format(currentDate, "yyyy")}&month=${format(
    currentDate,
    "M"
  )}`;
  const initialDividendsKey = useRef(dividendsKey);
  const {
    data: dividendsData,
    isLoading: dividendsLoading,
    error: dividendsError,
  } = useSWR(dividendsKey, {
    fallbackData:
      dividendsKey === initialDividendsKey.current ? initialDividends || [] : undefined,
    keepPreviousData: true,
  });
  const dividends = useMemo(() => dividendsData || [], [dividendsData]);
  const loading = dividendsLoading || jumpLoading;

  useEffect(() => {
    if (dividendsError) {
      addToast("股利資料載入失敗，請稍後再試。", "error");
    }
  }, [dividendsError, addToast]);

  useEffect(() => {
    setLocalYield(yieldThreshold);
  }, [yieldThreshold]);

  useEffect(() => {
    let storedMode = null;
    try {
      storedMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    } catch {
      storedMode = null;
    }

    if (storedMode === "grid" || storedMode === "list") {
      setViewMode(storedMode);
      return;
    }

    setViewMode(window.matchMedia("(max-width: 768px)").matches ? "list" : "grid");
  }, []);

  useEffect(() => {
    const dateParam = searchParams.get("date");
    const shouldOpenModal = searchParams.get("openModal") === "true";

    if (dateParam && !hasHandledJump.current) {
      const target = parseISO(dateParam);
      if (!Number.isNaN(target.getTime())) {
        setCurrentDate(target);
        setSelectedDate(target);

        if (shouldOpenModal) {
          setDateModalOpen(true);
          hasHandledJump.current = true;
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.delete("openModal");
            const nextPath = params.toString()
              ? `${pathname}?${params.toString()}`
              : pathname;
            router.replace(nextPath, { scroll: false });
          }, 500);
        }
      }
    }
  }, [searchParamsString, searchParams, setCurrentDate, pathname, router]);

  // 跳轉用：查某檔最近一次股利以決定要切到哪個月 (SWR 快取由代理層/後端 Redis 負責)
  const fetchStockLatest = async (code) => {
    return proxyGet(`api/stock/${code}/latest`);
  };

  const handleSuggestionClick = async (stock) => {
    trackEvent("search_stock", { source: "search_suggestion" });
    setFilterText(stock.stock_code);
    setJumpLoading(true);
    try {
      const latest = await fetchStockLatest(stock.stock_code);
      if (latest && (latest.pay_date || latest.ex_date)) {
        const targetDate = parseISO(latest.pay_date || latest.ex_date);
        if (!Number.isNaN(targetDate.getTime())) {
          setCurrentDate(targetDate);
        }
      } else {
        addToast("查無該股票近期股利資料", "info");
      }
    } catch (error) {
      addToast("切換股票時發生錯誤，稍後再試。", "error");
    } finally {
      setJumpLoading(false);
    }
  };

  const handleHistoryDateClick = (dateStr) => {
    if (!dateStr) return;
    const targetDate = parseISO(dateStr);
    if (!Number.isNaN(targetDate.getTime())) {
      setCurrentDate(targetDate);
      setSelectedDate(targetDate);
      setDateModalOpen(true);
      setStockModalOpen(false);
    }
  };

  const handleListStockClick = async (code, source = "list") => {
    trackEvent("stock_detail_open", { source });
    setSelectedStockCode(code);
    setStockModalOpen(true);
    try {
      const latest = await fetchStockLatest(code);
      if (latest && (latest.pay_date || latest.ex_date)) {
        const targetDate = parseISO(latest.pay_date || latest.ex_date);
        if (!Number.isNaN(targetDate.getTime())) {
          setCurrentDate(targetDate);
        }
      }
    } catch (error) {
      addToast("開啟股票資訊失敗，稍後再試。", "error");
    }
  };

  const handleStockClick = (code, source = "calendar") => {
    trackEvent("stock_detail_open", { source });
    setSelectedStockCode(code);
    setStockModalOpen(true);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // View switching must still work when storage is unavailable.
    }
  };

  const handleOpenPortfolio = (source) => {
    trackEvent("portfolio_open", {
      source,
      has_watchlist: watchlist.length > 0,
    });
    setPortfolioOpen(true);
  };

  const handleAddSampleWatchlist = (source = "calendar_summary") => {
    const missingCodes = SAMPLE_WATCHLIST.filter(
      (code) => !watchlistSet.has(code)
    );
    missingCodes.forEach((code) => toggleWatchlist(code));
    if (missingCodes.length > 0) {
      trackEvent("sample_watchlist_add", { source });
      addToast(
        `已加入 ${missingCodes.length} 檔範例自選，可立即試算年領股息`,
        "success"
      );
    }
  };

  const handleSuggestionWatchlistToggle = (stock) => {
    const isTracked = watchlistSet.has(stock.stock_code);
    toggleWatchlist(stock.stock_code);
    if (!isTracked) {
      trackEvent("watchlist_add", { source: "search_suggestion" });
    }
    addToast(
      isTracked
        ? `已將 ${stock.stock_code} 移出自選`
        : `已將 ${stock.stock_code} 加入自選`,
      isTracked ? "info" : "success"
    );
  };

  const handleStockModalWatchlistToggle = (code) => {
    const isTracked = watchlistSet.has(code);
    toggleWatchlist(code);
    if (!isTracked) {
      trackEvent("watchlist_add", { source: "stock_modal" });
    }
  };

  const trackPortfolioEditOnce = (field) => {
    if (trackedPortfolioEditsRef.current.has(field)) return;
    trackedPortfolioEditsRef.current.add(field);
    trackEvent("portfolio_value_edit", { field });
  };

  const handlePortfolioSharesChange = (code, value) => {
    updateShares(code, value);
    trackPortfolioEditOnce("shares");
  };

  const handlePortfolioCostChange = (code, value) => {
    updateCost(code, value);
    trackPortfolioEditOnce("cost");
  };

  const suggestions = useMemo(() => {
    if (!debouncedFilter) return [];
    const query = debouncedFilter.toLowerCase();
    return allStocks
      .filter(
        (stock) =>
          stock.stock_code.toLowerCase().startsWith(query) ||
          (stock.stock_name || "").toLowerCase().includes(query)
      )
      .sort((a, b) => a.stock_code.localeCompare(b.stock_code));
  }, [debouncedFilter, allStocks]);

  const filteredDividends = useMemo(() => {
    return dividends.filter((div) => {
      if (showWatchlistOnly && !watchlistSet.has(div.stock_code)) return false;
      if (showHighYieldOnly && !(div.yield_rate >= localYield)) return false;
      if (debouncedFilter) {
        const query = debouncedFilter.toLowerCase();
        return (
          (div.stock_code &&
            div.stock_code.toLowerCase().includes(query)) ||
          (div.stock_name && div.stock_name.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [
    dividends,
    showWatchlistOnly,
    watchlistSet,
    showHighYieldOnly,
    localYield,
    debouncedFilter,
  ]);

  const dividendsByDate = useMemo(() => {
    const map = new Map();
    filteredDividends.forEach((div) => {
      if (!div.pay_date) return;
      const list = map.get(div.pay_date) || [];
      list.push(div);
      map.set(div.pay_date, list);
    });
    return map;
  }, [filteredDividends]);

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const calendarDays = useMemo(() => {
    const monthEnd = endOfMonth(monthStart);
    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(monthEnd),
    });
  }, [monthStart]);

  // 清單視圖只需要當月的日子 (不含前後月的補滿格)
  const monthDays = useMemo(
    () =>
      eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) }),
    [monthStart]
  );

  const selectedDividends = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return dividendsByDate.get(key) || [];
  }, [selectedDate, dividendsByDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 pb-14 pt-3 md:px-8 md:pb-20 md:pt-6">
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4 md:px-5">
          <CalendarSummary
            currentDate={currentDate}
            filteredCount={filteredDividends.length}
            watchlistCount={watchlist.length}
            onOpenPortfolio={() => handleOpenPortfolio("calendar_summary")}
            onAddSampleWatchlist={() => handleAddSampleWatchlist("calendar_summary")}
          />
        </div>

        <div className="px-4 py-3 md:px-5 md:py-4">
          <FilterBar
            filterText={filterText}
            onFilterChange={setFilterText}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            watchlistSet={watchlistSet}
            onSuggestionWatchlistToggle={handleSuggestionWatchlistToggle}
            showWatchlistOnly={showWatchlistOnly}
            onToggleWatchlistOnly={() => setShowWatchlistOnly((prev) => !prev)}
            onOpenWatchlistModal={() => setWatchlistModalOpen(true)}
            showHighYieldOnly={showHighYieldOnly}
            onToggleHighYieldOnly={() => setShowHighYieldOnly((prev) => !prev)}
            localYield={localYield}
            onLocalYieldChange={(value) => {
              setLocalYield(value);
              if (!showHighYieldOnly) setShowHighYieldOnly(true);
            }}
            onCommitYield={setYieldThreshold}
            onOpenYieldList={() => setYieldListOpen(true)}
            onClearFilter={() => setFilterText("")}
          />
        </div>
      </section>

      <UpcomingFocus
        watchlistSet={watchlistSet}
        onStockClick={(code) => handleStockClick(code, "upcoming_focus")}
      />

      <div className="mt-4 flex w-full justify-center">
        <AdUnit type="horizontal" />
      </div>

      <section className="mt-6">
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                股利日曆
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                點擊日期展開發放清單，點擊股票進入個股詳情。
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {filteredDividends.length} 筆 ·{" "}
                {showWatchlistOnly ? "僅自選股" : "全部股票"} ·{" "}
                {showHighYieldOnly
                  ? `殖利率 > ${localYield}%`
                  : "未限制殖利率"}
                {showWatchlistOnly && " · 顯示我的入帳金額"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* 月曆 / 清單 視圖切換 */}
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => handleViewModeChange("grid")}
                  aria-pressed={viewMode === "grid"}
                  className={`min-h-11 rounded-md px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  月曆
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange("list")}
                  aria-pressed={viewMode === "list"}
                  className={`min-h-11 rounded-md px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  清單
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5 md:min-w-[240px]">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  aria-label="上一個月"
                >
                  ‹
                </button>
                <span className="min-w-[104px] whitespace-nowrap text-center text-sm font-black text-slate-900 md:min-w-[148px]">
                  {format(currentDate, "yyyy年 M月")}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  aria-label="下一個月"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative" aria-busy={loading}>
          {viewMode === null ? (
            <CalendarViewPlaceholder />
          ) : viewMode === "grid" ? (
            <CalendarGrid
              calendarDays={calendarDays}
              monthStart={monthStart}
              watchlistSet={watchlistSet}
              dividendsByDate={dividendsByDate}
              localYield={localYield}
              showAmounts={showWatchlistOnly}
              sharesMap={sharesMap}
              onDateSelect={(day) => {
                setSelectedDate(day);
                setDateModalOpen(true);
              }}
              onStockSelect={(code) => handleStockClick(code, "calendar_grid")}
            />
          ) : (
            <AgendaList
              monthDays={monthDays}
              dividendsByDate={dividendsByDate}
              watchlistSet={watchlistSet}
              showAmounts={showWatchlistOnly}
              sharesMap={sharesMap}
              onStockSelect={(code) => handleStockClick(code, "agenda_list")}
            />
          )}

          {loading && viewMode !== null && (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-white/75 pt-8 backdrop-blur-[1px]">
              <Loading text="正在更新日曆..." compact />
            </div>
          )}
        </div>
      </section>

      <DividendModal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        date={selectedDate}
        dividends={selectedDividends}
        onStockClick={(code) => handleStockClick(code, "dividend_modal")}
      />

      <StockModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        stockCode={selectedStockCode}
        isTracked={watchlist.includes(selectedStockCode)}
        onToggleTrack={handleStockModalWatchlistToggle}
        onHistoryDateClick={handleHistoryDateClick}
      />

      <WatchlistModal
        isOpen={watchlistModalOpen}
        onClose={() => setWatchlistModalOpen(false)}
        watchlist={watchlist}
        allStocks={allStocks}
        onRemove={toggleWatchlist}
        onStockClick={(code) => handleListStockClick(code, "watchlist_modal")}
      />

      <PortfolioModal
        isOpen={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        watchlist={watchlist}
        sharesMap={sharesMap}
        onSharesChange={handlePortfolioSharesChange}
        costMap={costMap}
        onCostChange={handlePortfolioCostChange}
        onExportData={exportData}
        onImportData={importData}
        onAddSampleWatchlist={() => handleAddSampleWatchlist("portfolio_modal")}
        onStockClick={(code) => {
          setPortfolioOpen(false);
          handleListStockClick(code, "portfolio_modal");
        }}
      />

      <YieldListModal
        isOpen={yieldListOpen}
        onClose={() => setYieldListOpen(false)}
        threshold={yieldThreshold}
        onStockClick={(code) => handleListStockClick(code, "yield_list_modal")}
      />

      <div className="mt-14">
        <SeoContent />
      </div>
    </main>
  );
}
