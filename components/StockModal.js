import { useEffect, useState } from "react";
import axios from "axios";
import { X, TrendingUp, Calendar, Heart } from "lucide-react";

export default function StockModal({ 
  isOpen, 
  onClose, 
  stockCode, 
  apiUrl,
  isTracked,
  onToggleTrack
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

  const currentInfo = history.length > 0 ? history[0] : null;

  // 3. 過濾邏輯：只保留「早於今天」的歷史紀錄
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 歸零時分秒，只比對日期

  const historicalRecords = history.filter(item => {
      // 優先判斷發放日，若無則判斷除息日
      const dateStr = item.pay_date || item.ex_date;
      if (!dateStr) return false;
      return new Date(dateStr) < today;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition">
            <X size={24} />
          </button>
          
          <div className="relative z-10 flex justify-between items-start mt-2">
            <div>
                <h2 className="text-3xl font-bold mb-1">{currentInfo?.stock_name || stockCode}</h2>
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
            <div className="py-10 text-center text-slate-500">載入中...</div>
          ) : (
            <div className="space-y-6">

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
              
              {/* 最新股利 */}
              {currentInfo && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="text-emerald-800 font-bold flex items-center gap-2 mb-3">
                    <TrendingUp size={18} /> 最新股利資訊
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">現金股利</div>
                      {/* 1. 修改：小數點後四位 */}
                      <div className="text-2xl font-bold text-emerald-700">
                        {Number(currentInfo.cash_dividend).toFixed(4)} <span className="text-sm">元</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">發放日期</div>
                      <div className="text-lg font-bold text-emerald-700">{currentInfo.pay_date || "尚未公布"}</div>
                      {/* 2. 修改：新增下方小字的除息日 */}
                      <div className="text-xs text-slate-400 mt-1">除息: {currentInfo.ex_date}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 歷史紀錄 (已過濾掉未來的) */}
              <div>
                <h3 className="text-slate-800 font-bold flex items-center gap-2 mb-4">
                  <Calendar size={18} /> 歷史發放紀錄
                </h3>
                <div className="space-y-3">
                    {/* 3. 修改：使用過濾後的 historicalRecords */}
                    {historicalRecords.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-2">無過去紀錄</div>
                    ) : (
                        historicalRecords.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <div className="text-sm font-medium text-slate-700">發放日: {item.pay_date || "未定"}</div>
                                    <div className="text-xs text-slate-400">除息日: {item.ex_date}</div>
                                </div>
                                <div className="text-right">
                                    {/* 1. 修改：小數點後四位 */}
                                    <div className="font-bold text-slate-800">{Number(item.cash_dividend).toFixed(4)} 元</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}