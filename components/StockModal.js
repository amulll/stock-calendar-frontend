import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import AdUnit from "./AdUnit"; // 引入招財貓廣告
import { X, TrendingUp, Calendar, Heart, Banknote, ChevronRight, ExternalLink, Download, CalendarPlus } from "lucide-react";
import Loading from "./Loading"; // 1. 引入
export default function StockModal({ 
  isOpen, 
  onClose, 
  stockCode, 
  apiUrl,
  isTracked,
  onToggleTrack,
  onHistoryDateClick // 2. 新增：接收跳轉函式
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stockCode) {
      setLoading(true);
      axios.get(`${apiUrl}/api/stock/${stockCode}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, stockCode, apiUrl]);

  if (!isOpen) return null;
const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentInfo = null;

  if (history.length > 0) {
      // 1. 資料清洗：優先過濾掉「現金股利為 0」的資料 (避免抓到空的預告)
      // 如果過濾完變空的(例如該股真的沒發錢)，就還是用原始列表，以免壞掉
      const validHistory = history.filter(item => Number(item.cash_dividend) > 0 || Number(item.stock_dividend) > 0);
      const sourceList = validHistory.length > 0 ? validHistory : history;

      // 2. 找出所有「未來 (含今日)」的除息場次
      const futureEvents = sourceList.filter(item => {
          if (!item.ex_date) return false;
          return new Date(item.ex_date) >= today;
      });

      if (futureEvents.length > 0) {
          // 3. 如果有未來場次，【強制重新排序】：由近到遠 (ASC)
          // 這樣 index 0 就會是「離今天最近」的那一筆 (D+2)
          // 例如：[11月, 12月] -> 取 11月
          futureEvents.sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date));
          currentInfo = futureEvents[0];
      } else {
          // 4. 如果沒有未來場次，就顯示「最新」的一筆歷史紀錄 (DESC 排序的第一筆)
          // 為了保險，我們也重新排一下：由遠到近 (DESC)
          const sortedHistory = [...sourceList].sort((a, b) => new Date(b.ex_date) - new Date(a.ex_date));
          currentInfo = sortedHistory[0];
      }
  }
// 歷史紀錄過濾 (只顯示今天之前的)
  const historicalRecords = history.filter(item => {
      const dateStr = item.pay_date || item.ex_date;
      if (!dateStr) return false;
      return new Date(dateStr) < today;
  });

  const generateDescription = (info) => {
    if (!info) return "";
    
    const { stock_code, stock_name, cash_dividend, ex_date, pay_date, yield_rate, stock_price } = info;
    const year = ex_date ? ex_date.split("-")[0] : new Date().getFullYear();
    
    let desc = `<strong>${stock_name} (${stock_code})</strong> `;
    
    if (cash_dividend > 0) {
        desc += `最新一期配發現金股利 <strong>${Number(cash_dividend).toFixed(2)}</strong> 元。`;
    }
    
    if (ex_date) {
        desc += `除權息交易日為 ${ex_date}，`;
    }
    
    if (pay_date) {
        desc += `現金股利發放日預計為 <strong>${pay_date}</strong>。`;
    } else {
        desc += `現金股利發放日尚未公告。`;
    }
    
    if (yield_rate > 0) {
        desc += ` 依據參考收盤價 ${stock_price} 元計算，預估現金殖利率約為 <span class="text-amber-600 font-bold">${yield_rate}%</span>。`;
    }
    
    return desc;
  };

  // 📅 1. 加入 Google Calendar
  const addToGoogleCalendar = (info) => {
    if (!info.pay_date) return;
    const dateStr = info.pay_date.replace(/-/g, ""); // 轉為 YYYYMMDD
    // 計算結束日期 (Google 全天事件需要 隔天)
    const nextDay = new Date(info.pay_date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0].replace(/-/g, "");

    const title = encodeURIComponent(`💰 領股利: ${info.stock_name} (${info.stock_code})`);
    const details = encodeURIComponent(`預計發放現金股利: ${info.cash_dividend} 元\n殖利率: ${info.yield_rate}%\n除息日: ${info.ex_date}`);
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${nextDayStr}&details=${details}`;
    window.open(url, '_blank');
  };

  // 🍎 2. 下載 ICS 檔案 (iOS / Outlook)
  const downloadIcsFile = (info) => {
    if (!info.pay_date) return;
    const dateStr = info.pay_date.replace(/-/g, "");
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:💰 領股利: ${info.stock_name}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DESCRIPTION:現金股利: ${info.cash_dividend}元\\n除息日: ${info.ex_date}`,
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
                <h2 className="text-3xl font-bold mb-1">{currentInfo?.stock_name || stockCode}</h2>
                {/* 🔥 新增：跳轉獨立頁面按鈕 */}
                <Link 
                    href={`/stock/${stockCode}`}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition text-white/90 hover:text-white"
                    title="查看完整詳情頁 (新分頁)"
                >
                    <ExternalLink size={16} />
                </Link>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{stockCode}</span>
                <span className="text-sm">{currentInfo?.market_type}</span>
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
          {loading ? (
            <div className="h-full flex items-center justify-center">
                <Loading text="正在查詢最新資料..." scale={0.4} /> {/* 縮小至 40% */}
            </div>
          ) : (
            <div className="space-y-6">

              {/* 新增：在最上方插入動態生成的文字 */}
              {currentInfo && (
                <div 
                    className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100"
                    dangerouslySetInnerHTML={{ __html: generateDescription(currentInfo) }}
                />
              )}

              {/* 股價與殖利率儀表板 */}
              {currentInfo && (
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-xs text-slate-500 mb-1">參考收盤價</div>
                        <div className="text-xl font-bold text-slate-700">
                            {currentInfo.stock_price ? `$${currentInfo.stock_price}` : "--"}
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center
                        ${currentInfo.yield_rate > 5 ? "bg-rose-50 border-rose-100" : "bg-blue-50 border-blue-100"}
                    `}>
                        <div className={`text-xs mb-1 ${currentInfo.yield_rate > 5 ? "text-rose-600" : "text-blue-600"}`}>
                            預估殖利率
                        </div>
                        <div className={`text-xl font-bold ${currentInfo.yield_rate > 5 ? "text-rose-600" : "text-blue-600"}`}>
                            {currentInfo.yield_rate ? `${currentInfo.yield_rate}%` : "--"}
                        </div>
                    </div>
                </div>
              )}
              
              {/* 最新股利資訊 */}
              {currentInfo && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="text-emerald-800 font-bold flex items-center gap-2 mb-3">
                    <Banknote size={18} /> 最新股利資訊
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">現金股利</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {Number(currentInfo.cash_dividend).toFixed(4)} <span className="text-sm">元</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">發放日期</div>
                      <div className="text-lg font-bold text-emerald-700">{currentInfo.pay_date || "尚未公布"}</div>
                      
                      {/* 📅 行事曆按鈕區塊 */}
                      {currentInfo.pay_date && (
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={() => addToGoogleCalendar(currentInfo)}
                                className="flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] text-emerald-700 hover:bg-emerald-100 transition"
                                title="加入 Google 日曆"
                            >
                                <CalendarPlus size={12} /> Google
                            </button>
                            <button 
                                onClick={() => downloadIcsFile(currentInfo)}
                                className="flex items-center gap-1 px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] text-emerald-700 hover:bg-emerald-100 transition"
                                title="加入 iOS/Outlook 日曆 (.ics)"
                            >
                                <CalendarPlus size={12} /> iOS
                            </button>
                        </div>
                      )}

                      <div className="text-xs text-slate-400 mt-2">除息: {currentInfo.ex_date}</div>
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
              
              {/* 🐱 招財貓版位 (In-Feed) */}
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