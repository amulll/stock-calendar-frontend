import { X, Trash2, ExternalLink } from "lucide-react";

export default function WatchlistModal({ 
  isOpen, 
  onClose, 
  watchlist, 
  allStocks, 
  onRemove, 
  onStockClick 
}) {
  if (!isOpen) return null;

  // 輔助函式：從代號查名稱
  const getStockName = (code) => {
    const stock = allStocks.find(s => s.stock_code === code);
    return stock ? stock.stock_name : "";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">我的追蹤清單 ({watchlist.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 overflow-y-auto flex-grow">
          {watchlist.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
                <p className="mb-2">📭</p>
                目前沒有追蹤任何股票
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((code) => (
                <div 
                  key={code} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition bg-white group"
                >
                  {/* 點擊區域：開啟詳細資訊 */}
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-grow"
                    onClick={() => {
                        onStockClick(code);
                        // 選擇是否要在點擊後關閉清單，這裡保留清單開啟以便連續操作
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm font-mono border border-rose-100">
                      {code}
                    </div>
                    <div>
                        <div className="font-bold text-slate-700 text-base">
                        {getStockName(code) || "載入中..."}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            查看詳情 <ExternalLink size={10} />
                        </div>
                    </div>
                  </div>

                  {/* 移除按鈕 */}
                  <button 
                    onClick={(e) => {
                        e.stopPropagation(); // 防止觸發開啟詳情
                        onRemove(code);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                    title="移除追蹤"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}