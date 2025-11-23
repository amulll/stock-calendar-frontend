import { useEffect, useState } from "react";
import axios from "axios";
import { X, TrendingUp, Calendar, Info } from "lucide-react";

export default function StockModal({ isOpen, onClose, stockCode, apiUrl }) {
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition">
            <X size={24} />
          </button>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-1">{currentInfo?.stock_name || stockCode}</h2>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{stockCode}</span>
              <span className="text-sm">{currentInfo?.market_type}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-slate-500">載入中...</div>
          ) : (
            <div className="space-y-6">
              
              {/* 最新股利 */}
              {currentInfo && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="text-emerald-800 font-bold flex items-center gap-2 mb-3">
                    <TrendingUp size={18} /> 最新股利資訊
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">現金股利</div>
                      <div className="text-2xl font-bold text-emerald-700">{currentInfo.cash_dividend} <span className="text-sm">元</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 mb-1">發放日期</div>
                      <div className="text-lg font-bold text-emerald-700">{currentInfo.pay_date || "尚未公布"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 歷史紀錄 */}
              <div>
                <h3 className="text-slate-800 font-bold flex items-center gap-2 mb-4">
                  <Calendar size={18} /> 歷史發放紀錄
                </h3>
                <div className="space-y-3">
                    {history.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                            <div>
                                <div className="text-sm font-medium text-slate-700">發放日: {item.pay_date || "未定"}</div>
                                <div className="text-xs text-slate-400">除息日: {item.ex_date}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-800">{item.cash_dividend} 元</div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
