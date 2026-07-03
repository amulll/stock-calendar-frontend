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
      <div className="flex max-h-[80vh] flex-col rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="text-lg font-black tracking-tight text-slate-900">
            我的追蹤清單 ({watchlist.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-3">
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
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:bg-slate-50"
                >
                  <button
                    className="flex flex-grow cursor-pointer items-center gap-3 text-left"
                    onClick={() => {
                      onStockClick(code);
                      onClose();
                    }}
                  >
                    <div className="flex h-10 w-14 items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-mono text-sm font-bold text-slate-700">
                      {code}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-700">
                        {getStockName(code) || "載入中..."}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        查看詳情 <ExternalLink size={10} />
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(code);
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
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
