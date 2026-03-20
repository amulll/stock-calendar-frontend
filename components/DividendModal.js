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
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">發放清單</h2>
            <p className="text-sm text-slate-500">
              {date && format(date, "yyyy年 M月 d日 (eeee)")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {dividends.length === 0 ? (
            <div className="text-center text-slate-500 py-8">無資料</div>
          ) : (
            <div className="space-y-3">
              {dividends.map((div) => (
                <button
                  key={div.id}
                  onClick={() => onStockClick(div.stock_code)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition bg-white group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition">
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
                    <div className="text-sm font-medium text-slate-500">
                      現金股利
                    </div>
                    <div className="text-lg font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <DollarSign size={14} />
                      {Number(div.cash_dividend).toFixed(4)}
                    </div>
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
