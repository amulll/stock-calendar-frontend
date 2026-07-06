"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { X, TrendingUp, Loader2, ArrowUpDown } from "lucide-react";

import ModalContainer from "./ModalContainer";
import { useToast } from "../hooks/useToast";

export default function YieldListModal({
  isOpen,
  threshold,
  onStockClick,
  onClose,
}) {
  const [sortAsc, setSortAsc] = useState(true);
  const { addToast } = useToast();

  const year = new Date().getFullYear();
  const { data, error, isLoading } = useSWR(
    isOpen ? `api/dividends/high-yield?threshold=${threshold}&year=${year}` : null
  );
  const dividends = Array.isArray(data) ? data : [];
  const loading = isLoading;

  useEffect(() => {
    if (error) {
      addToast("載入高殖利率清單失敗", "error");
    }
  }, [error, addToast]);

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
      <div className="flex max-h-[80vh] flex-col rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                全年度高殖利率清單
              </h2>
              <p className="text-xs font-medium text-amber-700">
                篩選：&gt;{threshold}% (共 {sortedList.length} 檔)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-end border-b border-slate-200 bg-slate-50 px-4 py-2">
          <button
            onClick={() => setSortAsc((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-800"
          >
            <ArrowUpDown size={12} />
            {sortAsc ? "由低到高 (方便篩選)" : "由高到低 (看最高)"}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto bg-slate-50 p-2">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-slate-400">
              <Loader2 className="animate-spin mr-2" /> 載入中...
            </div>
          ) : error ? (
            <div className="text-center text-rose-500 py-12 flex flex-col items-center">
              <TrendingUp size={48} className="mb-3 opacity-30" />
              <p className="font-medium">
                {error?.message || "載入高殖利率清單失敗"}
              </p>
            </div>
          ) : sortedList.length === 0 ? (
            <div className="text-center text-slate-400 py-12 flex flex-col items-center">
              <TrendingUp size={48} className="mb-3 opacity-20" />
              <p>沒有符合 {threshold}% 以上的股票</p>
            </div>
          ) : (
            <div className="space-y-2 p-1">
              {sortedList.map((div) => (
                <button
                  key={`${div.stock_code}-${div.ex_date}`}
                  className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-amber-300 hover:bg-amber-50/40"
                  onClick={() => {
                    onStockClick(div.stock_code);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-14 flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-mono text-xs text-slate-600">
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
                    <div className="flex items-center justify-end gap-1 text-lg font-bold text-amber-600">
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
