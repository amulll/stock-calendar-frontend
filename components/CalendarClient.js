"use client";

import SeoContent from "./SeoContent";
import { useState, useEffect, useMemo, useRef } from "react";
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
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import DividendModal from "./DividendModal";
import StockModal from "./StockModal";
import WatchlistModal from "./WatchlistModal";
import YieldListModal from "./YieldListModal";
import AdUnit from "./AdUnit";
import Loading from "./Loading";
import FilterBar from "./FilterBar";
import CalendarGrid from "./CalendarGrid";
import { useCalendarQueryState } from "../hooks/useCalendarQueryState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  getCachedDividends,
  setCachedDividends,
  getCachedStockLatest,
  setCachedStockLatest,
} from "../lib/cache";
import { useToast } from "../hooks/useToast";

const API_URL = "/api/proxy";

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

  const [dividends, setDividends] = useState(initialDividends || []);
  const [allStocks, setAllStocks] = useState(initialAllStocks || []);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [yieldListOpen, setYieldListOpen] = useState(false);
  const [localYield, setLocalYield] = useState(yieldThreshold);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const isFirstRender = useRef(true);
  const hasHandledJump = useRef(false);
  const debouncedFilter = useDebouncedValue(filterText, 250);
  const { addToast } = useToast();

  useEffect(() => {
    setLocalYield(yieldThreshold);
  }, [yieldThreshold]);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("myWatchlist");
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (err) {
        console.error("Failed to parse watchlist", err);
      }
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

  const fetchDividends = async (date) => {
    const year = format(date, "yyyy");
    const month = format(date, "M");
    const cacheKey = `${year}-${month}`;
    const cached = getCachedDividends(cacheKey);
    if (cached) {
      setDividends(cached);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/dividends?year=${year}&month=${month}`
      );
      setDividends(res.data);
      setCachedDividends(cacheKey, res.data);
    } catch (error) {
      addToast("股利資料載入失敗，請稍後再試。", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!initialDividends || initialDividends.length === 0) {
        fetchDividends(currentDate);
      }
      return;
    }
    fetchDividends(currentDate);
  }, [currentDate]);

  const fetchStockLatest = async (code) => {
    const cached = getCachedStockLatest(code);
    if (cached) return cached;
    const res = await axios.get(`${API_URL}/api/stock/${code}/latest`);
    setCachedStockLatest(code, res.data);
    return res.data;
  };

  const handleSuggestionClick = async (stock) => {
    setFilterText(stock.stock_code);
    setLoading(true);
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
      setLoading(false);
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

  const toggleWatchlist = (code) => {
    const exists = watchlist.includes(code);
    const updated = exists
      ? watchlist.filter((item) => item !== code)
      : [...watchlist, code];
    setWatchlist(updated);
    localStorage.setItem("myWatchlist", JSON.stringify(updated));
  };

  const watchlistSet = useMemo(() => new Set(watchlist), [watchlist]);

  const suggestions = useMemo(() => {
    if (!debouncedFilter) return [];
    const query = debouncedFilter.toLowerCase();
    return allStocks
      .filter(
        (stock) =>
          stock.stock_code.toLowerCase().startsWith(query) ||
          stock.stock_name.toLowerCase().includes(query)
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

  const selectedDividends = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return dividendsByDate.get(key) || [];
  }, [selectedDate, dividendsByDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <main className="min-h-screen p-2 md:p-8 max-w-7xl mx-auto">
      <div className="mb-4 w-full flex justify-center">
        <AdUnit type="horizontal" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-xl">
            <span role="img" aria-label="calendar">
              📅
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
            uGoodly 股利日曆
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={prevMonth}
            className="p-1 md:p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
            aria-label="上一個月"
          >
            ‹
          </button>
          <span className="text-lg font-semibold text-slate-700 min-w-[120px] text-center md:text-xl md:min-w-[140px]">
            {format(currentDate, "yyyy年 M月")}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 md:p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
            aria-label="下一個月"
          >
            ›
          </button>
        </div>
      </div>

      <FilterBar
        filterText={filterText}
        onFilterChange={setFilterText}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
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

      <CalendarGrid
        calendarDays={calendarDays}
        monthStart={monthStart}
        watchlistSet={watchlistSet}
        dividendsByDate={dividendsByDate}
        localYield={localYield}
        onDateSelect={(day) => {
          setSelectedDate(day);
          setDateModalOpen(true);
        }}
        onStockSelect={handleStockClick}
      />

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
        apiUrl={API_URL}
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

      <YieldListModal
        isOpen={yieldListOpen}
        onClose={() => setYieldListOpen(false)}
        threshold={yieldThreshold}
        onStockClick={handleListStockClick}
      />

      <div className="mt-12">
        <SeoContent />
      </div>
    </main>
  );
}
