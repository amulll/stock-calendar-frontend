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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import axios from "axios";
import DividendModal from "../components/DividendModal";
import StockModal from "../components/StockModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_SUGGESTIONS = 4; // 限制建議列表的數量以優化渲染效能

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filterText, setFilterText] = useState(''); 
  // 1. 新增：建議列表狀態
  const [suggestions, setSuggestions] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  // 輔助函式：從整個股利列表中找出唯一的股票清單作為建議來源
  // ⚠️ 備註：在生產環境中，建議在應用程式啟動時一次性獲取所有股票清單，而非只用當月資料。
  const getUniqueStocks = () => {
    const uniqueMap = new Map();
    dividends.forEach(d => {
        if (!uniqueMap.has(d.stock_code)) {
            uniqueMap.set(d.stock_code, d.stock_name);
        }
    });
    // 將 Map 轉為 { code: name } 陣列
    return Array.from(uniqueMap, ([code, name]) => ({ stock_code: code, stock_name: name }));
  };


  // 2. 處理輸入與建議邏輯
  const handleFilterChange = (text) => {
    setFilterText(text);
    
    if (text.length < 1) {
        setSuggestions([]);
        return;
    }

    const lowerCaseText = text.toLowerCase();
    const uniqueStocks = getUniqueStocks();
    
    const filteredSuggestions = uniqueStocks.filter(stock => 
        stock.stock_code.toLowerCase().includes(lowerCaseText) ||
        stock.stock_name.toLowerCase().includes(lowerCaseText)
    );

    setSuggestions(filteredSuggestions.slice(0, MAX_SUGGESTIONS));
  };
  
  // 3. 點擊建議項目
  const handleSuggestionClick = (code) => {
    setFilterText(code); // 將代號填回輸入框
    setSuggestions([]); // 清空建議列表
  };


  const getFilteredDividends = () => {
    if (!filterText) return dividends;
    const lowerCaseFilter = filterText.toLowerCase();
    
    return dividends.filter(d => 
      (d.stock_code && d.stock_code.toLowerCase().includes(lowerCaseFilter)) ||
      (d.stock_name && d.stock_name.toLowerCase().includes(lowerCaseFilter))
    );
  };
  
  const finalDividends = getFilteredDividends(); // 計算最終過濾後的列表

  // ... (其餘邏輯保持不變)

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

  // 月曆邏輯... (略)

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => {
      setCurrentDate(addMonths(currentDate, 1));
      setFilterText(''); // 切換月份時重設過濾器
      setSuggestions([]);
  };
  const prevMonth = () => {
      setCurrentDate(subMonths(currentDate, 1));
      setFilterText(''); // 切換月份時重設過濾器
      setSuggestions([]);
  };

  // 找出某一天的股利資料
  const getDividendsForDay = (day, sourceList) => {
    return sourceList.filter(d => d.pay_date && isSameDay(parseISO(d.pay_date), day));
  };

  // 點擊日期
  const handleDateClick = (day, dayDividends) => {
    if (dayDividends.length > 0) {
      setSelectedDate(day);
      setDateModalOpen(true);
    }
  };

  // 點擊公司
  const handleStockClick = (code) => {
    setSelectedStockCode(code);
    setStockModalOpen(true);
  };

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <main className="min-h-screen p-2 md:p-8 max-w-7xl mx-auto"> 
      
      {/* 1. 主Header (月份導航) - 保持不變 */}
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

      {/* 4. 置頂搜尋列與下拉選單容器 */}
      <div className="sticky top-2 md:top-6 z-20 mb-4 relative"> 
        <input
          type="text"
          value={filterText}
          onChange={(e) => handleFilterChange(e.target.value)}
          placeholder="🔍 輸入代號或公司名稱過濾..."
          className="w-full p-3 border border-blue-200 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-slate-700 placeholder-slate-400 bg-white"
          // 點擊輸入框外時隱藏建議
          onBlur={() => setTimeout(() => setSuggestions([]), 200)} 
        />
        
        {/* 5. Autocomplete 下拉選單 */}
        {suggestions.length > 0 && (
          <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {suggestions.map(stock => (
              <li 
                key={stock.stock_code}
                onMouseDown={() => handleSuggestionClick(stock.stock_code)} // 使用 onMouseDown 避免 onBlur 觸發
                className="p-3 cursor-pointer hover:bg-blue-50/50 transition duration-100 flex justify-between items-center text-sm"
              >
                <span className="font-semibold text-slate-800">{stock.stock_code}</span>
                <span className="text-slate-600 truncate ml-2">{stock.stock_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {weekdays.map((day) => (
            <div key={day} className="py-2 md:py-4 text-center text-xs md:text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
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
                  {/* 日期數字 */}
                  <span className={`
                    text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full
                    ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}
                  `}>
                    {format(day, "d")}
                  </span>
                  
                  {/* 股利計數：手機上只顯示一個小圓點，MD 以上顯示數量 */}
                  {dayDividends.length > 0 && (
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1 md:px-2 py-0.5 rounded-full">
                       <span className="hidden md:inline">{dayDividends.length} 家</span>
                       <span className="inline md:hidden">●</span> {/* 手機版簡化 */}
                     </span>
                  )}
                </div>

                {/* 公司列表 - 僅在 MD 以上顯示 */}
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

      {/* Modals */}
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