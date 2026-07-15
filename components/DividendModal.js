import { format } from "date-fns";
import { X, DollarSign } from "lucide-react";
import ModalContainer from "./ModalContainer";

export default function DividendModal({
  isOpen,
  onClose,
  date,
  dividends,
  onStockClick,
}) {
  if (!isOpen) return null;

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledby="dividend-modal-title"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <h2 id="dividend-modal-title" className="text-lg font-black tracking-tight text-slate-900">發放清單</h2>
            <p className="text-sm text-slate-500">
              {date && format(date, "yyyy年 M月 d日 (eeee)")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {dividends.length === 0 ? (
            <div className="text-center text-slate-500 py-8">無資料</div>
          ) : (
            <div className="space-y-2">
              {dividends.map((div) => (
                <button
                  type="button"
                  key={div.id}
                  onClick={() => onStockClick(div.stock_code)}
                  className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-14 items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-700 transition group-hover:border-blue-200 group-hover:text-blue-700">
                      {div.stock_code}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">
                        {div.stock_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {div.market_type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {Number(div.cash_dividend) > 0 ? (
                      <>
                        <div className="text-sm font-medium text-slate-500">
                          現金股利
                        </div>
                        <div className="flex items-center justify-end gap-1 text-lg font-bold text-emerald-600">
                          <DollarSign size={14} />
                          {Number(div.cash_dividend).toFixed(4)}
                        </div>
                      </>
                    ) : Number(div.stock_dividend) > 0 ? (
                      // 純配股場次：現金股利為 0，顯示股票股利避免誤導
                      <>
                        <div className="text-sm font-medium text-slate-500">
                          股票股利
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {Number(div.stock_dividend).toFixed(4)}
                        </div>
                      </>
                    ) : (
                      // ETF 常見：日程已公告、金額尚未公佈
                      <>
                        <div className="text-sm font-medium text-slate-500">
                          現金股利
                        </div>
                        <div className="text-sm font-bold text-slate-400">
                          金額未公告
                        </div>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
