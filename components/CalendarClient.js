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
    <main className="min-h-screen max-w-7xl mx-auto px-3 pb-14 pt-3 md:px-8 md:pb-20 md:pt-8">
      <section className="relative rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-blue-100 via-sky-50 to-white" />
          <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />
        </div>

        <div className="relative px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-blue-600/80">
                Dividend Calendar
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-6xl md:leading-[0.95]">
                掌握每月的
                <span className="block text-blue-600">配息節奏</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-lg md:leading-8">
                用更直覺的月曆視角查看台股現金股利發放日、殖利率與個股配息資訊。
                搜尋、篩選與追蹤清單都保留在同一個工作區，不用在多個畫面來回切換。
              </p>
            </div>

            <div className="xl:w-[420px]">
              <div className="rounded-[28px] bg-slate-950 px-4 py-4 text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.85)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Current View
                    </p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">
                    Live
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_84px_84px] gap-2 md:grid-cols-[minmax(0,1fr)_108px_108px] md:gap-3 md:items-start">
                  <div className="min-w-0">
                    <p className="whitespace-nowrap text-[1.75rem] font-black tracking-tight md:text-[1.9rem] lg:text-[2rem]">
                      {format(currentDate, "yyyy年 M月")}
                    </p>
                    <p className="mt-1 hidden text-xs font-medium text-slate-400 md:block">
                      目前檢視月份與篩選概況
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-white/10 bg-white/6 px-2.5 py-2.5 md:rounded-[20px] md:px-3 md:py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Entries
                    </p>
                    <p className="mt-1.5 text-xl font-black tracking-tight md:mt-2 md:text-2xl">
                      {filteredDividends.length}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-emerald-400/10 bg-emerald-400/8 px-2.5 py-2.5 md:rounded-[20px] md:px-3 md:py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-200/70">
                      Watchlist
                    </p>
                    <p className="mt-1.5 text-xl font-black tracking-tight md:mt-2 md:text-2xl">
                      {watchlist.length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] bg-white/5 p-2">
                  <button
                    onClick={prevMonth}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
                    aria-label="上一個月"
                  >
                    ‹
                  </button>
                  <span className="min-w-[132px] whitespace-nowrap text-center text-sm font-semibold text-slate-200 md:min-w-[156px] md:text-[0.95rem]">
                    {format(currentDate, "yyyy年 M月")}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
                    aria-label="下一個月"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
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
          </div>
        </div>
      </section>

      <div className="mt-4 flex w-full justify-center">
        <AdUnit type="horizontal" />
      </div>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600/75">
              Monthly Rhythm
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              本月股利日曆
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              以月份為單位查看即將發放的股利日期。點擊日期可展開清單，點擊股票可直接開啟個股詳情。
            </p>
          </div>

          <div className="hidden gap-3 sm:grid-cols-2 md:grid md:min-w-[340px]">
            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.3)]">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Active Filters
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {showWatchlistOnly ? "僅自選股" : "全部股票"} ·{" "}
                {showHighYieldOnly ? `高殖利率 > ${localYield}%` : "未限制殖利率"}
              </p>
            </div>
            <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 px-4 py-4 shadow-[0_18px_45px_-34px_rgba(59,130,246,0.25)]">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600/70">
                Quick Note
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                可從搜尋、追蹤或日期格直接進入個股與發放明細
              </p>
            </div>
          </div>
        </div>

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

      <div className="mt-14">
        <SeoContent />
      </div>
    </main>
  );
}
