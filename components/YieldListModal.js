"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, Loader2, ArrowUpDown } from "lucide-react";

import { proxyGet } from "../lib/proxy-client";
import ModalContainer from "./ModalContainer";
import { useToast } from "../hooks/useToast";

export default function YieldListModal({
  isOpen,
  threshold,
  onStockClick,
  onClose,
}) {
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchHighYieldStocks();
    }
  }, [isOpen, threshold]);

  const fetchHighYieldStocks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await proxyGet("api/dividends/high-yield", {
        threshold,
        year: new Date().getFullYear(),
      });
      setDividends(Array.isArray(data) ? data : []);
    } catch (error) {
      setDividends([]);
      setError(error.message || "載入高殖利率清單失敗");
      addToast("載入高殖利率清單失敗", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const sortedList = [...dividends].sort((a, b) =>
    sortAsc
      ? (a.yield_rate || 0) - (b.yield_rate || 0)
      : (b.yield_rate || 0) - (a.yield_rate || 0)
  );

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[80vh]"
    >
      <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-amber-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                全年度高殖利率清單
              </h2>
              <p className="text-xs text-amber-600 font-medium">
                篩選：&gt;{threshold}% (共 {sortedList.length} 檔)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition text-slate-500"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-end">
          <button
            onClick={() => setSortAsc((prev) => !prev)}
            className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowUpDown size={12} />
            {sortAsc ? "由低到高 (方便篩選)" : "由高到低 (看最高)"}
          </button>
        </div>

        <div className="p-2 overflow-y-auto flex-grow bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-slate-400">
              <Loader2 className="animate-spin mr-2" /> 載入中...
            </div>
          ) : error ? (
            <div className="text-center text-rose-500 py-12 flex flex-col items-center">
              <TrendingUp size={48} className="mb-3 opacity-30" />
              <p className="font-medium">{error}</p>
            </div>
          ) : sortedList.length === 0 ? (
            <div className="text-center text-slate-400 py-12 flex flex-col items-center">
              <TrendingUp size={48} className="mb-3 opacity-20" />
              <p>沒有符合 {threshold}% 以上的股票</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {sortedList.map((div) => (
                <button
                  key={`${div.stock_code}-${div.ex_date}`}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition text-left group"
                  onClick={() => {
                    onStockClick(div.stock_code);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs border border-slate-200">
                      <span className="font-bold text-sm">
                        {div.stock_code}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">
                        {div.stock_name}
                      </div>
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
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
