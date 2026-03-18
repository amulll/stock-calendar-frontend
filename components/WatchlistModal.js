import { X, Trash2, ExternalLink } from "lucide-react";
import ModalContainer from "./ModalContainer";

export default function WatchlistModal({
  isOpen,
  onClose,
  watchlist,
  allStocks,
  onRemove,
  onStockClick,
}) {
  if (!isOpen) return null;

  const getStockName = (code) => {
    const stock = allStocks.find((s) => s.stock_code === code);
    return stock ? stock.stock_name : "";
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[80vh]"
    >
      <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            我的追蹤清單 ({watchlist.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>
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
                  <button
                    className="flex items-center gap-3 cursor-pointer flex-grow text-left"
                    onClick={() => {
                      onStockClick(code);
                      onClose();
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
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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
    </ModalContainer>
  );
}
