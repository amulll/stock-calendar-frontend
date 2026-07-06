"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  X,
  Wallet,
  Loader2,
  TrendingUp,
  PiggyBank,
  ChevronRight,
} from "lucide-react";

import ModalContainer from "./ModalContainer";
import { proxyGet } from "../lib/proxy-client";
import { useToast } from "../hooks/useToast";

const DEFAULT_SHARES = 1000; // 未設定時預設 1 張
const MONTH_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function formatMoney(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
}

// 從單一個股的詳情計算「年度領息」相關數字
// costPrice：使用者自訂的每股成本；未設定 (0/空) 時退回最新收盤價
function computeStockIncome(detail, shares, currentYear, costPrice) {
  const info = detail?.info || null;
  const history = Array.isArray(detail?.history) ? detail.history : [];
  const marketPrice = Number(info?.daily_price) || 0;
  const effectiveCost = Number(costPrice) > 0 ? Number(costPrice) : marketPrice;

  // 一檔股票一年可能配息多次 (季配/月配)，取當年度全部現金股利加總
  const thisYear = history.filter((record) => {
    const dateStr = record.pay_date || record.ex_date;
    return dateStr && Number(dateStr.slice(0, 4)) === currentYear;
  });

  let records = thisYear;
  if (records.length === 0) {
    // 當年度尚無資料時，退而用最近一筆配息當估算
    const latest = [...history]
      .filter((record) => record.ex_date)
      .sort((a, b) => new Date(b.ex_date) - new Date(a.ex_date))[0];
    records = latest ? [latest] : [];
  }

  const annualCash = records.reduce(
    (sum, record) => sum + (Number(record.cash_dividend) || 0),
    0
  );

  const monthly = new Array(12).fill(0);
  records.forEach((record) => {
    const dateStr = record.pay_date || record.ex_date;
    if (!dateStr) return;
    const monthIndex = Number(dateStr.slice(5, 7)) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      monthly[monthIndex] += (Number(record.cash_dividend) || 0) * shares;
    }
  });

  return {
    name: info?.stock_name || null,
    marketPrice,
    costPrice: effectiveCost,
    isCustomCost: Number(costPrice) > 0,
    annualCash,
    income: annualCash * shares,
    cost: effectiveCost * shares,
    yieldRate: effectiveCost > 0 ? (annualCash / effectiveCost) * 100 : 0,
    monthly,
    usedEstimate: thisYear.length === 0 && records.length > 0,
    hasData: annualCash > 0,
  };
}

// 只在失焦或按 Enter 時才提交，避免每打一個字就更新父層 state 導致重繪、游標跳掉
function EditableNumber({ value, onCommit, className, ...props }) {
  const [local, setLocal] = useState(value === "" || value == null ? "" : String(value));
  const [editing, setEditing] = useState(false);

  // 非編輯中時，跟著外部值同步 (例如「帶回現價」清空、或程式改動)
  useEffect(() => {
    if (!editing) {
      setLocal(value === "" || value == null ? "" : String(value));
    }
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    onCommit(local);
  };

  return (
    <input
      {...props}
      className={className}
      value={local}
      onFocus={() => setEditing(true)}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export default function PortfolioModal({
  isOpen,
  onClose,
  watchlist,
  sharesMap,
  onSharesChange,
  costMap,
  onCostChange,
  onStockClick,
}) {
  const { addToast } = useToast();
  const { mutate } = useSWRConfig();
  const currentYear = new Date().getFullYear();

  // 用「整個自選清單」當 key，一次平行抓取所有個股詳情並快取整包結果。
  // 抓到後順手 mutate 各檔 api/stock/{code}，讓之後開啟個股視窗能命中同一份 SWR 快取。
  const swrKey =
    isOpen && watchlist.length > 0 ? ["portfolio", ...watchlist] : null;

  const { data: details, isLoading: loading } = useSWR(swrKey, async (key) => {
    const codes = key.slice(1);
    const entries = await Promise.all(
      codes.map(async (code) => {
        try {
          const detail = await proxyGet(`api/stock/${code}`);
          mutate(`api/stock/${code}`, detail, { revalidate: false });
          return [code, detail];
        } catch (error) {
          return [code, null];
        }
      })
    );
    return Object.fromEntries(entries);
  });

  // 有個股載入失敗時提醒一次 (details 每次抓取才會換 reference)
  useEffect(() => {
    if (!details) return;
    const failed = Object.values(details).filter((d) => !d).length;
    if (failed > 0) {
      addToast(`有 ${failed} 檔資料載入失敗，試算可能不完整`, "info");
    }
  }, [details, addToast]);

  const rows = useMemo(() => {
    const detailsMap = details || {};
    return watchlist.map((code) => {
      const shares = Number(sharesMap[code] ?? DEFAULT_SHARES);
      const customCost = costMap[code];
      const detail = detailsMap[code];
      const computed = detail
        ? computeStockIncome(detail, shares, currentYear, customCost)
        : null;
      // 成本輸入框：有自訂就顯示自訂值，否則留空 (以現價當 placeholder，避免只是聚焦就鎖定成本)
      const costInputValue =
        customCost !== undefined && customCost !== "" ? customCost : "";
      return { code, shares, computed, costInputValue };
    });
  }, [watchlist, sharesMap, costMap, details, currentYear]);

  const totals = useMemo(() => {
    let income = 0;
    let cost = 0;
    const monthly = new Array(12).fill(0);
    rows.forEach(({ computed }) => {
      if (!computed) return;
      income += computed.income;
      cost += computed.cost;
      computed.monthly.forEach((value, index) => {
        monthly[index] += value;
      });
    });
    return {
      income,
      cost,
      monthly,
      yieldRate: cost > 0 ? (income / cost) * 100 : 0,
      maxMonth: Math.max(...monthly, 0),
    };
  }, [rows]);

  if (!isOpen) return null;

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="max-w-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[88vh]"
    >
      <div className="flex max-h-[88vh] flex-col rounded-xl border border-slate-200 bg-white">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                我的存股組合
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {currentYear} 年度預估領息 · 共 {watchlist.length} 檔
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

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center text-slate-400">
            <PiggyBank size={48} className="opacity-30" />
            <p className="font-medium">還沒有自選股</p>
            <p className="text-sm">
              先在日曆或個股視窗點愛心加入追蹤，再回來試算年領股息。
            </p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto">
            {/* 總覽卡片 */}
            <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold text-emerald-700">
                  預估年領股息
                </div>
                <div className="mt-1 text-xl font-black tracking-tight text-emerald-800">
                  ${formatMoney(totals.income)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                <div className="text-[11px] font-semibold text-slate-500">
                  投入總成本
                </div>
                <div className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  ${formatMoney(totals.cost)}
                </div>
              </div>
              <div className="col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 sm:col-span-1">
                <div className="text-[11px] font-semibold text-amber-700">
                  加權平均殖利率
                </div>
                <div className="mt-1 flex items-center gap-1 text-xl font-black tracking-tight text-amber-700">
                  <TrendingUp size={16} />
                  {totals.yieldRate.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* 每月現金流 */}
            {totals.maxMonth > 0 && (
              <div className="border-b border-slate-200 p-4">
                <div className="mb-2 text-xs font-semibold text-slate-500">
                  每月現金流分布
                </div>
                <div className="flex items-end justify-between gap-1" style={{ height: 64 }}>
                  {totals.monthly.map((value, index) => {
                    const heightPct =
                      totals.maxMonth > 0
                        ? Math.max((value / totals.maxMonth) * 100, value > 0 ? 6 : 2)
                        : 2;
                    return (
                      <div
                        key={index}
                        className="flex h-full flex-1 items-end"
                        title={`${MONTH_LABELS[index]}月：$${formatMoney(value)}`}
                      >
                        <div
                          className={`w-full rounded-t ${
                            value > 0 ? "bg-emerald-400" : "bg-slate-100"
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-1 flex justify-between gap-1">
                  {MONTH_LABELS.map((label) => (
                    <span
                      key={label}
                      className="flex-1 text-center text-[9px] text-slate-400"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 逐檔明細 */}
            <div className="p-3">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                  <Loader2 className="animate-spin" size={16} /> 載入個股資料中...
                </div>
              )}
              <div className="space-y-2">
                {rows.map(({ code, shares, computed, costInputValue }) => (
                  <div
                    key={code}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onStockClick(code)}
                        className="group flex min-w-0 items-center gap-2 text-left"
                      >
                        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-sm font-bold text-slate-700">
                          {code}
                        </span>
                        <span className="truncate text-sm font-bold text-slate-700 group-hover:text-blue-600">
                          {computed?.name || "—"}
                        </span>
                        <ChevronRight
                          size={14}
                          className="flex-shrink-0 text-slate-300 group-hover:text-blue-400"
                        />
                      </button>
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-700">
                          ${formatMoney(computed?.income || 0)}
                        </div>
                        <div className="text-[10px] text-slate-400">年領股息</div>
                      </div>
                    </div>

                    {/* 持有股數 + 每股成本 (可自訂，預設帶入現價) */}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400">
                        持有
                        <EditableNumber
                          type="number"
                          min="0"
                          step="1000"
                          inputMode="numeric"
                          value={shares}
                          onCommit={(raw) =>
                            onSharesChange(code, Math.max(0, Number(raw) || 0))
                          }
                          className="min-w-0 flex-1 bg-transparent text-right font-mono text-sm font-bold text-slate-700 outline-none"
                        />
                        股
                      </label>
                      <label className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400">
                        成本
                        <EditableNumber
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={costInputValue}
                          onCommit={(raw) => onCostChange(code, raw.trim())}
                          placeholder={computed ? String(computed.marketPrice) : ""}
                          className="min-w-0 flex-1 bg-transparent text-right font-mono text-sm font-bold text-slate-700 outline-none"
                        />
                        元
                      </label>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>
                          現金股利{" "}
                          <span className="font-semibold text-slate-600">
                            {computed ? computed.annualCash.toFixed(2) : "--"}
                          </span>
                        </span>
                        <span>
                          {computed?.isCustomCost ? "投報率" : "殖利率"}{" "}
                          <span className="font-semibold text-amber-600">
                            {computed ? `${computed.yieldRate.toFixed(2)}%` : "--"}
                          </span>
                        </span>
                      </div>
                      {computed && computed.isCustomCost && (
                        <button
                          type="button"
                          onClick={() => onCostChange(code, "")}
                          className="text-blue-500 transition hover:underline"
                        >
                          帶回現價 ${computed.marketPrice || "--"}
                        </button>
                      )}
                    </div>

                    {computed?.usedEstimate && (
                      <div className="mt-1.5 text-[10px] text-slate-400">
                        * 當年度尚無配息資料，以最近一次配息估算
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 text-[11px] leading-5 text-slate-400">
              成本價預設帶入最新收盤價，可自行改成你的實際買入均價，殖利率會即時換算為投報率。
              試算未計入交易成本與稅費，僅供參考；張數與成本設定僅儲存在此裝置瀏覽器。
            </div>
          </div>
        )}
      </div>
    </ModalContainer>
  );
}
