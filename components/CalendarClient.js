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

const SAMPLE_WATCHLIST = ["0056", "00878", "2330"];

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
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [yieldListOpen, setYieldListOpen] = useState(false);
  const [localYield, setLocalYield] = useState(yieldThreshold);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const hasHandledJump = useRef(false);
  const userChoseViewRef = useRef(false);
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
    if (
      !userChoseViewRef.current &&
      window.matchMedia("(max-width: 768px)").matches
    ) {
      setViewMode("list");
    }
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

  const handleListStockClick = async (code) => {
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

  const handleStockClick = (code) => {
    setSelectedStockCode(code);
    setStockModalOpen(true);
  };

  const handleViewModeChange = (mode) => {
    userChoseViewRef.current = true;
    setViewMode(mode);
  };

  const handleAddSampleWatchlist = () => {
    const missingCodes = SAMPLE_WATCHLIST.filter(
      (code) => !watchlistSet.has(code)
    );
    missingCodes.forEach((code) => toggleWatchlist(code));
    if (missingCodes.length > 0) {
      addToast("已加入 3 檔範例自選，可立即試算年領股息", "success");
    }
  };

  const handleSuggestionWatchlistToggle = (stock) => {
    const isTracked = watchlistSet.has(stock.stock_code);
    toggleWatchlist(stock.stock_code);
    addToast(
      isTracked
        ? `已將 ${stock.stock_code} 移出自選`
        : `已將 ${stock.stock_code} 加入自選`,
      isTracked ? "info" : "success"
    );
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
            onOpenPortfolio={() => setPortfolioOpen(true)}
            onAddSampleWatchlist={handleAddSampleWatchlist}
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

      <UpcomingFocus watchlistSet={watchlistSet} onStockClick={handleStockClick} />

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

            <div className="flex items-center gap-2">
              {/* 月曆 / 清單 視圖切換 */}
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  aria-pressed={viewMode === "grid"}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  月曆
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  aria-pressed={viewMode === "list"}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
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
                  onClick={prevMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-100"
                  aria-label="上一個月"
                >
                  ‹
                </button>
                <span className="min-w-[104px] whitespace-nowrap text-center text-sm font-black text-slate-900 md:min-w-[148px]">
                  {format(currentDate, "yyyy年 M月")}
                </span>
                <button
                  onClick={nextMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-100"
                  aria-label="下一個月"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
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
            onStockSelect={handleStockClick}
          />
        ) : (
          <AgendaList
            monthDays={monthDays}
            dividendsByDate={dividendsByDate}
            watchlistSet={watchlistSet}
            showAmounts={showWatchlistOnly}
            sharesMap={sharesMap}
            onStockSelect={handleStockClick}
          />
        )}
      </section>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading text="正在更新日曆..." scale={0.5} />
        </div>
      )}

      <DividendModal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        date={selectedDate}
        dividends={selectedDividends}
        onStockClick={handleStockClick}
      />

      <StockModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        stockCode={selectedStockCode}
        isTracked={watchlist.includes(selectedStockCode)}
        onToggleTrack={toggleWatchlist}
        onHistoryDateClick={handleHistoryDateClick}
      />

      <WatchlistModal
        isOpen={watchlistModalOpen}
        onClose={() => setWatchlistModalOpen(false)}
        watchlist={watchlist}
        allStocks={allStocks}
        onRemove={toggleWatchlist}
        onStockClick={handleListStockClick}
      />

      <PortfolioModal
        isOpen={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        watchlist={watchlist}
        sharesMap={sharesMap}
        onSharesChange={updateShares}
        costMap={costMap}
        onCostChange={updateCost}
        onExportData={exportData}
        onImportData={importData}
        onAddSampleWatchlist={handleAddSampleWatchlist}
        onStockClick={(code) => {
          setPortfolioOpen(false);
          handleListStockClick(code);
        }}
      />

      <YieldListModal
        isOpen={yieldListOpen}
        onClose={() => setYieldListOpen(false)}
        threshold={yieldThreshold}
        onStockClick={handleListStockClick}
      />

      <div className="mt-14">
        <SeoContent />
      </div>
    </main>
  );
}
