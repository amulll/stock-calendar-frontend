"use client";

import { X, Trash2, ExternalLink, CalendarPlus } from "lucide-react";
import ModalContainer from "./ModalContainer";
import { useToast } from "../hooks/useToast";
import { subscribeToCalendar } from "../lib/calendarSubscribe";

export default function WatchlistModal({
  isOpen,
  onClose,
  watchlist,
  allStocks,
  onRemove,
  onStockClick,
}) {
  const { addToast } = useToast();

  if (!isOpen) return null;

  const getStockName = (code) => {
    const stock = allStocks.find((s) => s.stock_code === code);
    return stock ? stock.stock_name : "";
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledby="watchlist-modal-title"
      contentClassName="max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[80vh]"
    >
      <div className="flex max-h-[80vh] flex-col rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 id="watchlist-modal-title" className="text-lg font-black tracking-tight text-slate-900">
            我的追蹤清單 ({watchlist.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
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
                    type="button"
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(code);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    title="移除追蹤"
                    aria-label={`移除追蹤：${code} ${getStockName(code)}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {watchlist.length > 0 && (
          <div className="flex-shrink-0 border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={() =>
                subscribeToCalendar(watchlist, addToast, "watchlist_modal")
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <CalendarPlus size={17} />
              訂閱到我的行事曆
            </button>
          </div>
        )}
      </div>
    </ModalContainer>
  );
}
