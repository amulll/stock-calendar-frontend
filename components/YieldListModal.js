import { X, ExternalLink, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function YieldListModal({ 
  isOpen, 
  onClose, 
  dividends, // 這是已經過濾好的高殖利率股票列表
  threshold,
  onStockClick 
}) {
  if (!isOpen) return null;

  // 依殖利率由高到低排序
  const sortedList = [...dividends].sort((a, b) => (b.yield_rate || 0) - (a.yield_rate || 0));

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
                <h2 className="text-lg font-bold text-slate-800">高殖利率清單</h2>
                <p className="text-xs text-amber-600 font-medium">
                    篩選標準： &gt; {threshold}% ({sortedList.length} 檔)
                </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 overflow-y-auto flex-grow bg-slate-50/50">
          {sortedList.length === 0 ? (
            <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                <TrendingUp size={48} className="mb-3 opacity-20" />
                <p>本月沒有符合條件的股票</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {sortedList.map((div) => (
                <div 
                  key={`${div.stock_code}-${div.ex_date}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
                  onClick={() => {
                      onStockClick(div.stock_code);
                      // 保持清單開啟或關閉視需求而定，這裡建議關閉以便看詳情
                      // onClose(); 
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
                    <div className="text-xs text-slate-400">殖利率</div>
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