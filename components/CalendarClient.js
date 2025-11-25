"use client";

import { useState, useEffect } from "react";
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
  parseISO 
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Search, Heart } from "lucide-react";
import axios from "axios";
import DividendModal from "../components/DividendModal";
import StockModal from "../components/StockModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_SUGGESTIONS = 4;

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 搜尋與過濾
  const [filterText, setFilterText] = useState(''); 
  const [suggestions, setSuggestions] = useState([]);
  const [allStocks, setAllStocks] = useState([]); 

  // ❤️ 追蹤清單 (Watchlist) 相關狀態
  const [watchlist, setWatchlist] = useState([]);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false); // 開關：是否只看追蹤
  
  // Modal States
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [showHighYieldOnly, setShowHighYieldOnly] = useState(false);
  
  // 1. 初始化：載入股票清單 & LocalStorage
  useEffect(() => {
    // 載入 API 股票清單
    axios.get(`${API_URL}/api/stocks/list`)
      .then(res => setAllStocks(res.data))
      .catch(err => console.error(err));

    // 載入 LocalStorage 追蹤清單
    const savedWatchlist = localStorage.getItem("myWatchlist");
    if (savedWatchlist) {
        try {
            setWatchlist(JSON.parse(savedWatchlist));
        } catch (e) {
            console.error("Failed to parse watchlist", e);
        }
    }
  }, []);

  // ❤️ 2. 追蹤功能邏輯
  const toggleWatchlist = (code) => {
    let newWatchlist;
    if (watchlist.includes(code)) {
        // 移除
        newWatchlist = watchlist.filter(c => c !== code);
    } else {
        // 新增
        newWatchlist = [...watchlist, code];
    }
    setWatchlist(newWatchlist);
    // 儲存到 LocalStorage
    localStorage.setItem("myWatchlist", JSON.stringify(newWatchlist));
  };

  // 取得當月資料
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
    fetchDividends(currentDate);
  }, [currentDate]);

  // 搜尋建議邏輯
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
  
  // 跳轉邏輯
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

 // 3. 綜合過濾邏輯 (文字搜尋 + 追蹤清單 + 高殖利率)
  const getFilteredDividends = () => {
    let result = dividends;

    // A. 追蹤過濾：如果開啟「只看追蹤」，先過濾掉不在清單內的
    if (showWatchlistOnly) {
        result = result.filter(d => watchlist.includes(d.stock_code));
    }

    // 🔥 B. 高殖利率過濾 (新增)：只顯示殖利率 >= 5% 的股票
    if (showHighYieldOnly) {
        // 確保有 yield_rate 欄位且數值大於等於 5.0
        result = result.filter(d => d.yield_rate && d.yield_rate >= 5.0);
    }

    // C. 文字搜尋：最後進行關鍵字匹配
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

  // 月曆邏輯
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarIcon size={20} className="md:w-6 md:h-6" /> 
          </div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">台股股利發放日曆</h1>
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

      {/* ❤️ 搜尋與過濾控制區 */}
      <div className="sticky top-2 md:top-6 z-20 mb-4 flex gap-2 relative"> 
        
        {/* 搜尋框 */}
        <div className="relative flex-grow">
            <input
            type="text"
            value={filterText}
            onChange={(e) => handleFilterChange(e.target.value)}
            placeholder="🔍 搜尋代號 (2330...)"
            className="w-full p-3 pl-10 border border-blue-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            {filterText && (
                <button onClick={() => {setFilterText(''); setSuggestions([]);}} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">✕</button>
            )}
            
            {/* 建議下拉選單 */}
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

        {/* ❤️ 追蹤切換按鈕 */}
        <button
            onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
            className={`
                flex items-center gap-2 px-4 py-3 rounded-xl shadow-sm transition font-medium whitespace-nowrap
                ${showWatchlistOnly 
                    ? "bg-rose-500 text-white shadow-rose-200 ring-2 ring-rose-300" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}
            `}
        >
            <Heart size={20} className={showWatchlistOnly ? "fill-white" : ""} />
            <span className="hidden md:inline">只看追蹤</span>
        </button>
        <button
            onClick={() => setShowHighYieldOnly(!showHighYieldOnly)}
            className={`
                flex items-center gap-2 px-4 py-3 rounded-xl shadow-sm transition font-medium whitespace-nowrap
                ${showHighYieldOnly 
                    ? "bg-amber-500 text-white shadow-amber-200 ring-2 ring-amber-300" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}
            `}
        >
            <span>🔥 &gt;5%</span>
        </button>
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
            
            // 🔥🔥🔥 新增關鍵邏輯：檢查當天是否有「追蹤清單內」的股票
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
                    <div key={div.id} className="text-xs truncate text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50">
                      {watchlist.includes(div.stock_code) && <span className="text-rose-500 mr-1">♥</span>}
                      {div.stock_code} {div.stock_name}
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
        // ❤️ 傳遞追蹤狀態
        isTracked={watchlist.includes(selectedStockCode)}
        onToggleTrack={toggleWatchlist}
      />
    </main>
  );
}