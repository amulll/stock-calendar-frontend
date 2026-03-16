import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import AdUnit from "./AdUnit"; 
import { X, Heart, Banknote, ChevronRight, ExternalLink, CalendarPlus, Calendar } from "lucide-react";
import Loading from "./Loading"; 
import { startOfDay, parseISO } from "date-fns";

export default function StockModal({ 
  isOpen, 
  onClose, 
  stockCode, 
  apiUrl,
  isTracked,
  onToggleTrack,
  onHistoryDateClick 
}) {
  const [history, setHistory] = useState([]); // 存配息紀錄
  const [info, setInfo] = useState(null);     // 🔥 新增：存基本資料 (含最新股價)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stockCode) {
      setLoading(true);
      setInfo(null); // 重置
      setHistory([]);

      axios.get(`${apiUrl}/api/stock/${stockCode}`)
        .then(res => {
            // 🔥 修改：分別從 API 回傳物件中取出 info 和 history
            setInfo(res.data.info);
            setHistory(res.data.history);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, stockCode, apiUrl]);

  if (!isOpen) return null;
  const today = startOfDay(new Date());
  
  // --- 邏輯處理：找出「最新/未來」的配息事件 ---
  let currentEvent = null;

  if (history.length > 0) {
      // 1. 資料清洗
      const validHistory = history.filter(item => Number(item.cash_dividend) > 0 || Number(item.stock_dividend) > 0);
      const sourceList = validHistory.length > 0 ? validHistory : history;

      // 2. 找出未來場次
      const futureEvents = sourceList.filter(item => {
          if (!item.ex_date) return false;
          const exDate = parseISO(item.ex_date);
          return exDate >= today;
      });

      if (futureEvents.length > 0) {
          // 有未來：取日期最近的 (ASC)
          futureEvents.sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date));
          currentEvent = futureEvents[0];
      } else {
          // 沒未來：取歷史最新的 (DESC)
          const sortedHistory = [...sourceList].sort((a, b) => new Date(b.ex_date) - new Date(a.ex_date));
          currentEvent = sortedHistory[0];
      }
  }

  // --- 邏輯處理：歷史列表 (排除未來) ---
  const historicalRecords = history.filter(item => {
      const dateStr = item.pay_date || item.ex_date;
      if (!dateStr) return false;
      return new Date(dateStr) < today;
  });

  // 📅 1. 加入 Google Calendar
  const addToGoogleCalendar = () => {
    if (!currentEvent?.pay_date || !info) return;
    const dateStr = currentEvent.pay_date.replace(/-/g, ""); 
    const nextDay = new Date(currentEvent.pay_date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0].replace(/-/g, "");

    const title = encodeURIComponent(`💰 領股利: ${info.stock_name} (${info.stock_code})`);
    const details = encodeURIComponent(`預計發放現金股利: ${currentEvent.cash_dividend} 元\n除息日: ${currentEvent.ex_date}`);
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${nextDayStr}&details=${details}`;
    window.open(url, '_blank');
  };

  // 🍎 2. 下載 ICS 檔案
  const downloadIcsFile = () => {
    if (!currentEvent?.pay_date || !info) return;
    const dateStr = currentEvent.pay_date.replace(/-/g, "");
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:💰 領股利: ${info.stock_name}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DESCRIPTION:現金股利: ${currentEvent.cash_dividend}元\\n除息日: ${currentEvent.ex_date}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dividend_${info.stock_code}_${dateStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 計算顯示用的殖利率
  const displayYield = (currentEvent && info?.daily_price) 
    ? ((currentEvent.cash_dividend / info.daily_price) * 100).toFixed(2)
    : "--";
  const displayMarket = (info?.market_type === "TPEX" || info?.market_type === "上櫃") ? "上櫃" : "上市";

  const renderSummary = () => {
    if (!info || !currentEvent) return null;

    const { stock_code, stock_name, daily_price } = info;
    const { cash_dividend, ex_date, pay_date } = currentEvent;
    const yieldRate =
      cash_dividend && daily_price > 0
        ? ((cash_dividend / daily_price) * 100).toFixed(2)
        : null;

    return (
      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
        <p>
          <strong>{stock_name} ({stock_code})</strong>
          {" "}最新一期配發現金股利
          <strong> {Number(cash_dividend || 0).toFixed(2)} 元</strong>。
        </p>
        <p>
          除權息交易日為 <strong>{ex_date || "尚未公告"}</strong>，
          現金股利發放日
          <strong> {pay_date || "尚未公告"}</strong>。
        </p>
        {yieldRate && (
          <p>
            依據最新收盤價 <strong>{daily_price}</strong> 元估算，
            預估現金殖利率約為 <strong className="text-amber-600">{yieldRate}%</strong>。
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition z-20">
            <X size={24} />
          </button>
          
          <div className="relative z-10 flex justify-between items-start mt-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {/* 🔥 修改：使用 info.stock_name */}
                <h2 className="text-3xl font-bold mb-1">{info?.stock_name || stockCode}</h2>
                <Link 
                    href={`/stock/${stockCode}`}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition text-white/90 hover:text-white"
                    title="查看完整詳情頁"
                >
                    <ExternalLink size={16} />
                </Link>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{stockCode}</span>
                {/* 🔥 修改：使用 info.market_type */}
                <span className="text-sm">{displayMarket}</span>
              </div>
            </div>

            <button 
                onClick={() => onToggleTrack(stockCode)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition active:scale-95 mr-8"
                title={isTracked ? "取消追蹤" : "加入追蹤"}
            >
                <Heart 
                    size={24} 
                    className={isTracked ? "fill-rose-400 text-rose-400" : "text-white"} 
                />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading || !info ? (
            <div className="h-full flex items-center justify-center">
                <Loading text="正在查詢最新資料..." scale={0.4} />
            </div>
          ) : (
            <div className="space-y-6">

              {/* 動態生成的文字 (Info Box) */}
              {renderSummary()}

              {/* 股價與殖利率儀表板 */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-xs text-slate-500 mb-1">最新收盤價</div>
                        <div className="text-xl font-bold text-slate-700">
                            {/* 🔥 修改：使用 info.daily_price */}
                            {info.daily_price ? `$${info.daily_price}` : "--"}
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center
                        ${displayYield > 5 ? "bg-rose-50 border-rose-100" : "bg-blue-50 border-blue-100"}
                    `}>
                        <div className={`text-xs mb-1 ${displayYield > 5 ? "text-rose-600" : "text-blue-600"}`}>
                            預估殖利率
                        </div>
                        <div className={`text-xl font-bold ${displayYield > 5 ? "text-rose-600" : "text-blue-600"}`}>
                            {displayYield !== "--" ? `${displayYield}%` : "--"}
                        </div>
                    </div>
              </div>
              
              {/* 最新股利資訊 */}
              {currentEvent && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="text-emerald-800 font-bold flex items-center gap-2 mb-3">
                    <Banknote size={18} /> 最新股利資訊
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">現金股利</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {Number(currentEvent.cash_dividend).toFixed(4)} <span className="text-sm">元</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">發放日期</div>
                      <div className="text-lg font-bold text-emerald-700">{currentEvent.pay_date || "尚未公布"}</div>
                      
                      {/* 行事曆按鈕 */}
                      {currentEvent.pay_date && (
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={addToGoogleCalendar}
                                className="flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] text-emerald-700 hover:bg-emerald-100 transition"
                            >
                                <CalendarPlus size={12} /> Google
                            </button>
                            <button 
                                onClick={downloadIcsFile}
                                className="flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] text-emerald-700 hover:bg-emerald-100 transition"
                            >
                                <CalendarPlus size={12} /> iOS
                            </button>
                        </div>
                      )}

                      <div className="text-xs text-slate-400 mt-2">除息: {currentEvent.ex_date}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 歷史紀錄 */}
              <div>
                <h3 className="text-slate-800 font-bold flex items-center gap-2 mb-4">
                  <Calendar size={18} /> 歷史發放紀錄
                  <span className="text-xs font-normal text-slate-400 ml-auto">(點擊跳轉)</span>
                </h3>
                <div className="space-y-2">
                    {historicalRecords.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-2">無過去紀錄</div>
                    ) : (
                        historicalRecords.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => onHistoryDateClick(item.pay_date || item.ex_date)}
                                className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-blue-200 cursor-pointer transition group"
                            >
                                <div>
                                    <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition">
                                        發放日: {item.pay_date || "未定"}
                                    </div>
                                    <div className="text-xs text-slate-400">除息日: {item.ex_date}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-slate-800">{Number(item.cash_dividend).toFixed(4)} 元</div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
              </div>
              
              {/* 招財貓版位 */}
              <div className="pt-4 border-t border-slate-100">
                <AdUnit type="rectangle" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
