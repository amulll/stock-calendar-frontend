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
import { zhTW } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import axios from "axios";
import DividendModal from "../components/DividendModal";
import StockModal from "../components/StockModal";

// 設定 API URL (從環境變數讀取，預設為 localhost)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);

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

  // 月曆邏輯
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // 找出某一天的股利資料
  const getDividendsForDay = (day) => {
    return dividends.filter(d => d.pay_date && isSameDay(parseISO(d.pay_date), day));
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

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarIcon size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">台股股利發放日曆</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
            <ChevronLeft />
          </button>
          <span className="text-xl font-semibold text-slate-700 min-w-[140px] text-center">
            {format(currentDate, "yyyy年 M月")}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
            <div key={day} className="py-4 text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayDividends = getDividendsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDateClick(day, dayDividends)}
                className={`
                  min-h-[120px] p-2 border-b border-r border-slate-100 transition-all relative
                  ${!isCurrentMonth ? "bg-slate-50 text-slate-400" : "bg-white"}
                  ${dayDividends.length > 0 ? "cursor-pointer hover:bg-blue-50/50" : ""}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}
                  `}>
                    {format(day, "d")}
                  </span>
                  {dayDividends.length > 0 && (
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                       {dayDividends.length} 家
                     </span>
                  )}
                </div>

                {/* 公司列表 (最多顯示 3 家) */}
                <div className="space-y-1">
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
        dividends={selectedDate ? getDividendsForDay(selectedDate) : []}
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
