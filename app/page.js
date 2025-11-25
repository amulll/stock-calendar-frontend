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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Search } from "lucide-react";
import axios from "axios";
import DividendModal from "../components/DividendModal";
import StockModal from "../components/StockModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_SUGGESTIONS = 4; // 建議數量限制

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filterText, setFilterText] = useState(''); 
  
  // 1. 新增：全域股票清單狀態
  const [allStocks, setAllStocks] = useState([]); 
  const [suggestions, setSuggestions] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  // 2. 初始化時：取得所有股票清單 (只做一次)
  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/stocks/list`);
        setAllStocks(res.data);
      } catch (error) {
        console.error("Failed to fetch stock list:", error);
      }
    };
    fetchAllStocks();
  }, []);

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

  // 3. 搜尋建議邏輯 (改用 allStocks 過濾)
  const handleFilterChange = (text) => {
    setFilterText(text);
    
    if (text.length < 1) {
        setSuggestions([]);
        return;
    }

    const lowerCaseText = text.toLowerCase();
    
    // 使用全域清單進行過濾
    const filteredSuggestions = allStocks.filter(stock => 
        stock.stock_code.toLowerCase().startsWith(lowerCaseText) || // 代號用 startsWith
        stock.stock_name.toLowerCase().includes(lowerCaseText)      // 名稱用 includes
    );

    // 排序：讓數字小的代號排前面
    filteredSuggestions.sort((a, b) => a.stock_code.localeCompare(b.stock_code));

    setSuggestions(filteredSuggestions.slice(0, MAX_SUGGESTIONS));
  };
  
  // 4. 關鍵功能：點擊建議後「跳轉」到該股票月份
  const handleSuggestionClick = async (stock) => {
    setFilterText(stock.stock_code); // 填入代號
    setSuggestions([]); // 關閉選單
    setLoading(true);

    try {
        // 呼叫後端查詢該股票「最新」的日期
        const res = await axios.get(`${API_URL}/api/stock/${stock.stock_code}/latest`);
        
        if (res.data && (res.data.pay_date || res.data.ex_date)) {
            // 優先使用發放日，若無則用除息日
            const targetDateStr = res.data.pay_date || res.data.ex_date;
            const targetDate = parseISO(targetDateStr);
            
            // 檢查目標日期是否與當前顯示月份不同
            if (!isSameMonth(targetDate, currentDate)) {
                console.log(`Jumping to ${targetDateStr}`);
                setCurrentDate(targetDate); // 觸發月份切換 -> useEffect 會自動重抓該月資料
            } else {
                // 如果已經在同一個月，就不需要切換，useEffect 也不會觸發
                // 但因為 filterText 已經設定了，畫面會自動過濾出該股票
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

  // 前端顯示過濾 (針對當月已載入的資料)
  const getFilteredDividends = () => {
    if (!filterText) return dividends;
    const lowerCaseFilter = filterText.toLowerCase();
    
    return dividends.filter(d => 
      (d.stock_code && d.stock_code.toLowerCase().includes(lowerCaseFilter)) ||
      (d.stock_name && d.stock_name.toLowerCase().includes(lowerCaseFilter))
    );
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

      {/* 置頂搜尋列 */}
      <div className="sticky top-2 md:top-6 z-20 mb-4 relative"> 
        <div className="relative">
            <input
            type="text"
            value={filterText}
            onChange={(e) => handleFilterChange(e.target.value)}
            placeholder="🔍 輸入代號或名稱 (搜尋全域)..."
            className="w-full p-3 pl-10 border border-blue-200 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-slate-700 placeholder-slate-400 bg-white"
            // 移除 onBlur，改用點擊事件控制，避免點擊建議時選單先消失
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            
            {/* 清除按鈕 (當有輸入文字時顯示) */}
            {filterText && (
                <button 
                    onClick={() => {
                        setFilterText('');
                        setSuggestions([]);
                    }}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                    ✕
                </button>
            )}
        </div>
        
        {/* Autocomplete 下拉選單 */}
        {suggestions.length > 0 && (
          <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {suggestions.map(stock => (
              <li 
                key={stock.stock_code}
                // 這裡傳入整個 stock 物件
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
                  
                  {dayDividends.length > 0 && (
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1 md:px-2 py-0.5 rounded-full">
                       <span className="hidden md:inline">{dayDividends.length} 家</span>
                       <span className="inline md:hidden">●</span> 
                     </span>
                  )}
                </div>

                <div className="hidden md:block space-y-1"> 
                  {dayDividends.slice(0, 3).map((div) => (
                    <div key={div.id} className="text-xs truncate text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50">
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
      />
    </main>
  );
}