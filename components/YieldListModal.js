import { useState, useEffect } from "react";
import { X, ExternalLink, TrendingUp, Loader2, ArrowUpDown } from "lucide-react";
import axios from "axios";

export default function YieldListModal({ 
  isOpen, 
  threshold, // 當前的門檻 (例如 5)
  onStockClick, // 接收 handleListStockClick
  onClose 
  
}) {
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true); // 預設由低到高 (3%, 4%, 5%...)

  // 當 Modal 開啟或門檻改變時，去後端抓全域資料
  useEffect(() => {
    if (isOpen) {
      fetchHighYieldStocks();
    }
  }, [isOpen, threshold]);

  const fetchHighYieldStocks = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // 呼叫新做的後端 API
      const res = await axios.get(`${API_URL}/api/dividends/high-yield`, {
        params: {
          threshold: threshold,
          year: new Date().getFullYear() // 只看今年的
        }
      });
      setDividends(res.data);
    } catch (error) {
      console.error("Fetch high yield failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // 前端排序邏輯 (支援切換)
  const sortedList = [...dividends].sort((a, b) => {
    return sortAsc 
      ? (a.yield_rate || 0) - (b.yield_rate || 0) // 低 -> 高
      : (b.yield_rate || 0) - (a.yield_rate || 0); // 高 -> 低
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-amber-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <TrendingUp size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">全年度高殖利率清單</h2>
                <p className="text-xs text-amber-600 font-medium">
                    篩選：&gt;{threshold}% (共 {sortedList.length} 檔)
                </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar: 排序切換 */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-end">
            <button 
                onClick={() => setSortAsc(!sortAsc)}
                className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 transition"
            >
                <ArrowUpDown size={12} />
                {sortAsc ? "由低到高 (方便篩選)" : "由高到低 (看最高)"}
            </button>
        </div>

        {/* Content */}
        <div className="p-2 overflow-y-auto flex-grow bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-slate-400">
                <Loader2 className="animate-spin mr-2" /> 載入中...
            </div>
          ) : sortedList.length === 0 ? (
            <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                <TrendingUp size={48} className="mb-3 opacity-20" />
                <p>沒有符合 {threshold}% 以上的股票</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {sortedList.map((div) => (
                <div 
                  key={`${div.stock_code}-${div.ex_date}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
                  onClick={() => {
                      onStockClick(div.stock_code); // 跳轉 + 開 StockModal
                      onClose();                    // 關閉自己
                      // 這裡不關閉清單，讓使用者可以看完一個再看下一個
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs border border-slate-200">
                        <span className="font-bold text-sm">{div.stock_code}</span>
                    </div>
                    <div>
                        <div className="font-bold text-slate-700">{div.stock_name}</div>
                        <div className="text-xs text-slate-400">
                            除息: {div.ex_date}
                        </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-500 flex items-center justify-end gap-1">
                        {div.yield_rate}%
                    </div>
                    <div className="text-xs text-slate-400">預估殖利率</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}