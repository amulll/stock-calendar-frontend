"use client";

import { useState, useEffect, useRef } from "react";
// 1. 新增引入 useSearchParams, useRouter
import { useSearchParams, useRouter } from "next/navigation"; 
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  isValid // 記得引入 isValid
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Search, Heart, List, TrendingUp } from "lucide-react";
import axios from "axios";
import DividendModal from "./DividendModal";
import StockModal from "./StockModal";
import WatchlistModal from "./WatchlistModal";
import YieldListModal from "./YieldListModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_SUGGESTIONS = 4;

export default function CalendarClient({ initialDividends, initialAllStocks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [dividends, setDividends] = useState(initialDividends || []);
  const [allStocks, setAllStocks] = useState(initialAllStocks || []);
  const [loading, setLoading] = useState(false);
  
  // 搜尋
  const [filterText, setFilterText] = useState(''); 
  const [suggestions, setSuggestions] = useState([]);

  // 追蹤清單
  const [watchlist, setWatchlist] = useState([]);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [watchlistMenuOpen, setWatchlistMenuOpen] = useState(false); 
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false); 

  // 高殖利率篩選
  const [showHighYieldOnly, setShowHighYieldOnly] = useState(false); 
  const [yieldThreshold, setYieldThreshold] = useState(5);           
  const [yieldMenuOpen, setYieldMenuOpen] = useState(false);         
  const [yieldListOpen, setYieldListOpen] = useState(false);         
  
  // Modal States
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const isFirstRender = useRef(true);
  const yieldMenuRef = useRef(null); 
  const watchlistMenuRef = useRef(null);

  // 2. 初始化 Router 和 Params
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔥 新增：監聽 URL 參數，自動跳轉日期
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const targetDate = parseISO(dateParam);
      
      // 檢查日期是否有效
      if (isValid(targetDate)) {
         // A. 設定當前月份 (這會觸發 fetchDividends 更新資料)
         setCurrentDate(targetDate);
         
         // B. 設定選中日期並開啟 Modal
         setSelectedDate(targetDate);
         setDateModalOpen(true);

         // C. 清除網址參數 (避免重新整理頁面時又跳一次，保持網址乾淨)
         router.replace("/", { scroll: false });
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("myWatchlist");
    if (savedWatchlist) {
        try {
            setWatchlist(JSON.parse(savedWatchlist));
        } catch (e) {
            console.error("Failed to parse watchlist", e);
        }
    }

    function handleClickOutside(event) {
      if (yieldMenuRef.current && !yieldMenuRef.current.contains(event.target)) {
        setYieldMenuOpen(false);
      }
      if (watchlistMenuRef.current && !watchlistMenuRef.current.contains(event.target)) {
        setWatchlistMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleWatchlist = (code) => {
    let newWatchlist;
    if (watchlist.includes(code)) {
        newWatchlist = watchlist.filter(c => c !== code);
    } else {
        newWatchlist = [...watchlist, code];
    }
    setWatchlist(newWatchlist);
    localStorage.setItem("myWatchlist", JSON.stringify(newWatchlist));
  };

  const fetchDividends = async (date) => {
    setLoading(true);
    try {
      const year = format(date, "yyyy");
      const month = format(date, "M");
      const res = await axios.get(`${API_URL}/api/dividends?year=${year}&month=${month}`);
      setDividends(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchDividends(currentDate);
  }, [currentDate]);

  const handleFilterChange = (text) => {
    setFilterText(text);
    if (text.length < 1) {
        setSuggestions([]);
        return;
    }
    const lowerCaseText = text.toLowerCase();
    const filteredSuggestions = allStocks.filter(stock => 
        stock.stock_code.toLowerCase().startsWith(lowerCaseText) || 
        stock.stock_name.toLowerCase().includes(lowerCaseText)
    );
    filteredSuggestions.sort((a, b) => a.stock_code.localeCompare(b.stock_code));
    setSuggestions(filteredSuggestions.slice(0, MAX_SUGGESTIONS));
  };
  
  const handleSuggestionClick = async (stock) => {
    setFilterText(stock.stock_code);
    setSuggestions([]);
    setLoading(true);
    try {
        const res = await axios.get(`${API_URL}/api/stock/${stock.stock_code}/latest`);
        if (res.data && (res.data.pay_date || res.data.ex_date)) {
            const targetDateStr = res.data.pay_date || res.data.ex_date;
            const targetDate = parseISO(targetDateStr);
            if (!isSameMonth(targetDate, currentDate)) {
                setCurrentDate(targetDate);
            }
        } else {
            alert("查無該股票近期股利資料");
        }
    } catch (error) {
        console.error("Jump error:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleHistoryDateClick = (dateStr) => {
    if (!dateStr) return;
    const targetDate = parseISO(dateStr);
    if (!isSameMonth(targetDate, currentDate)) {
        setCurrentDate(targetDate);
    }
    setSelectedDate(targetDate);
    setDateModalOpen(true);
    setStockModalOpen(false);
  };

  const handleListStockClick = async (code) => {
    setSelectedStockCode(code);
    setStockModalOpen(true);
    try {
        const res = await axios.get(`${API_URL}/api/stock/${code}/latest`);
        if (res.data && (res.data.pay_date || res.data.ex_date)) {
            const targetDateStr = res.data.pay_date || res.data.ex_date;
            const targetDate = parseISO(targetDateStr);
            if (!isSameMonth(targetDate, currentDate)) {
                setCurrentDate(targetDate);
            }
        }
    } catch (error) {
        console.error("List jump error:", error);
    }
  };

  const getFilteredDividends = () => {
    let result = dividends;

    if (showWatchlistOnly) {
        result = result.filter(d => watchlist.includes(d.stock_code));
    }

    if (showHighYieldOnly) {
        result = result.filter(d => d.yield_rate && d.yield_rate >= yieldThreshold);
    }

    if (filterText) {
        const lowerCaseFilter = filterText.toLowerCase();
        result = result.filter(d => 
          (d.stock_code && d.stock_code.toLowerCase().includes(lowerCaseFilter)) ||
          (d.stock_name && d.stock_name.toLowerCase().includes(lowerCaseFilter))
        );
    }
    return result;
  };
  
  const finalDividends = getFilteredDividends(); 
  const getHighYieldList = () => dividends.filter(d => d.yield_rate && d.yield_rate >= yieldThreshold);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDividendsForDay = (day, sourceList) => {
    return sourceList.filter(d => d.pay_date && isSameDay(parseISO(d.pay_date), day));
  };

  const handleDateClick = (day, dayDividends) => {
    if (dayDividends.length > 0) {
      setSelectedDate(day);
      setDateModalOpen(true);
    }
  };

  const handleStockClick = (code) => {
    setSelectedStockCode(code);
    setStockModalOpen(true);
  };

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <main className="min-h-screen p-2 md:p-8 max-w-7xl mx-auto"> 
      
      {/* 📢 廣告版位 A (Top Banner) 
      <div className="mb-4 w-full flex justify-center">
        <div className="w-full max-w-[728px] h-[90px] bg-slate-100 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-slate-400 text-sm">
          廣告贊助版位 (728x90)
        </div>
      </div>
      */}
      {/* 🐱 招財貓版位 (Top Banner) */}
      <div className="mb-4 w-full flex justify-center">
        <AdUnit type="horizontal" />
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarIcon size={20} className="md:w-6 md:h-6" /> 
          </div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">uGoodly 股利日曆</h1>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={prevMonth} className="p-1 md:p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold text-slate-700 min-w-[120px] text-center md:text-xl md:min-w-[140px]">
            {format(currentDate, "yyyy年 M月")}
          </span>
          <button onClick={nextMonth} className="p-1 md:p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 搜尋與過濾控制區 */}
      <div className="sticky top-2 md:top-6 z-20 mb-4 flex gap-2 relative items-center"> 
        
        {/* 搜尋框 */}
        <div className="relative flex-grow">
            <input
            type="text"
            value={filterText}
            onChange={(e) => handleFilterChange(e.target.value)}
            placeholder="🔍 搜尋代號..."
            className="w-full p-3 pl-10 border border-blue-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            {filterText && (
                <button onClick={() => {setFilterText(''); setSuggestions([]);}} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">✕</button>
            )}
            {suggestions.length > 0 && (
            <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {suggestions.map(stock => (
                <li 
                    key={stock.stock_code}
                    onMouseDown={() => handleSuggestionClick(stock)} 
                    className="p-3 cursor-pointer hover:bg-blue-50/50 transition duration-100 flex justify-between items-center text-sm border-b border-slate-50 last:border-0"
                >
                    <span className="font-bold text-slate-800 font-mono text-base">{stock.stock_code}</span>
                    <span className="text-slate-600 truncate ml-2">{stock.stock_name}</span>
                </li>
                ))}
            </ul>
            )}
        </div>

        {/* 按鈕群組 */}
        <div className="flex gap-2">
            {/* 追蹤選單 */}
            <div className="relative" ref={watchlistMenuRef}>
                <button
                    onClick={() => setWatchlistMenuOpen(!watchlistMenuOpen)}
                    className={`
                        p-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1 min-w-[3.5rem]
                        ${showWatchlistOnly 
                            ? "bg-rose-500 text-white shadow-rose-200 ring-2 ring-rose-300" 
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}
                    `}
                    title="我的追蹤"
                >
                    <Heart size={20} className={showWatchlistOnly ? "fill-white" : ""} />
                </button>

                {watchlistMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-slate-700">只顯示追蹤</span>
                            <button 
                                onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showWatchlistOnly ? 'bg-rose-500' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${showWatchlistOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setWatchlistModalOpen(true);
                                setWatchlistMenuOpen(false);
                            }}
                            className="w-full py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                        >
                            <List size={16} />
                            管理我的清單
                        </button>
                    </div>
                )}
            </div>
            
            {/* 高殖利率選單 */}
            <div className="relative" ref={yieldMenuRef}>
                <button
                    onClick={() => setYieldMenuOpen(!yieldMenuOpen)}
                    className={`
                        p-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1 min-w-[4.5rem]
                        ${showHighYieldOnly 
                            ? "bg-amber-500 text-white shadow-amber-200 ring-2 ring-amber-300" 
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}
                    `}
                    title="殖利率篩選"
                >
                    <TrendingUp size={20} />
                    <span className="font-bold text-sm">&gt;{yieldThreshold}%</span>
                </button>

                {yieldMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-slate-700">殖利率篩選</span>
                            <button 
                                onClick={() => setShowHighYieldOnly(!showHighYieldOnly)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showHighYieldOnly ? 'bg-amber-500' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${showHighYieldOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                                <span>門檻值</span>
                                <span className="font-bold text-amber-600">{yieldThreshold}%</span>
                            </div>
                            <input 
                                type="range" min="1" max="20" step="0.5"
                                value={yieldThreshold} 
                                onChange={(e) => {
                                    setYieldThreshold(Number(e.target.value));
                                    setShowHighYieldOnly(true); 
                                }}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>1%</span>
                                <span>20%</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setYieldListOpen(true);
                                setYieldMenuOpen(false);
                            }}
                            className="w-full py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                        >
                            <List size={16} />
                            查看符合清單
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {weekdays.map((day) => (
            <div key={day} className="py-2 md:py-4 text-center text-xs md:text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayDividends = getDividendsForDay(day, finalDividends); 
            const isToday = isSameDay(day, new Date());
            
            const hasTrackedStock = dayDividends.some(div => watchlist.includes(div.stock_code));
            
            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDateClick(day, dayDividends)}
                className={`
                  min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-b border-r border-slate-100 transition-all relative
                  ${!isCurrentMonth ? "bg-slate-50 text-slate-400" : "bg-white"}
                  ${dayDividends.length > 0 ? "cursor-pointer hover:bg-blue-50/50" : ""}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`
                    text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full
                    ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}
                  `}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {/* ❤️ 愛心指標：手機和電腦都會顯示 */}
                    {hasTrackedStock && (
                        <Heart size={14} className="fill-rose-500 text-rose-500" />
                    )}

                    {/* 股利計數 (綠色小圓點/標籤) */}
                    {dayDividends.length > 0 && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1 md:px-2 py-0.5 rounded-full">
                        <span className="hidden md:inline">{dayDividends.length} 家</span>
                        <span className="inline md:hidden">●</span> 
                        </span>
                    )}
                  </div>
                </div>

                <div className="hidden md:block space-y-1"> 
                  {dayDividends.slice(0, 3).map((div) => (
                    <div key={div.id} className="text-xs truncate text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50 flex justify-between items-center">
                      <div className="flex items-center">
                        {watchlist.includes(div.stock_code) && <span className="text-rose-500 mr-1 text-[10px]">♥</span>}
                        {div.stock_code} {div.stock_name}
                      </div>
                      {div.yield_rate > 0 && (
                        <span className={`text-[10px] ml-1 ${div.yield_rate >= yieldThreshold ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                            {div.yield_rate}%
                        </span>
                      )}
                    </div>
                  ))}
                  {dayDividends.length > 3 && (
                    <div className="text-xs text-slate-400 pl-1">
                      還有 {dayDividends.length - 3} 家...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      )}

      <DividendModal 
        isOpen={dateModalOpen} 
        onClose={() => setDateModalOpen(false)} 
        date={selectedDate}
        dividends={selectedDate ? getDividendsForDay(selectedDate, finalDividends) : []} 
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
    </main>
  );
}