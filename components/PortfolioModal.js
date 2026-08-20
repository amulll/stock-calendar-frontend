"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import {
  X,
  Wallet,
  Loader2,
  TrendingUp,
  PiggyBank,
  ChevronRight,
  Share2,
  CalendarPlus,
  Download,
  Upload,
} from "lucide-react";

import ModalContainer from "./ModalContainer";
import CalendarSubscribeGuide from "./CalendarSubscribeGuide";
import { proxyGet } from "../lib/proxy-client";
import { shareCard } from "../lib/shareCard";
import { subscribeToCalendar } from "../lib/calendarSubscribe";
import { trackEvent } from "../lib/analytics";
import { getTaipeiYear } from "../lib/stockMetadata.mjs";
import {
  DEFAULT_SHARES,
  computeStockIncome,
  summarizePortfolioRows,
} from "../lib/portfolioMetrics.mjs";
import { useToast } from "../hooks/useToast";

const BACKUP_REMINDER_STORAGE_KEY = "ugoodlyBackupReminderHandledV1";
const MONTH_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function formatMoney(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
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
  variant = "modal",
  watchlist,
  sharesMap,
  onSharesChange,
  costMap,
  onCostChange,
  onExportData,
  onImportData,
  onAddSampleWatchlist,
  onStockClick,
}) {
  const active = variant === "page" || isOpen;
  const { addToast } = useToast();
  const { mutate } = useSWRConfig();
  const [sharing, setSharing] = useState(false);
  const [subscriptionGuideOpen, setSubscriptionGuideOpen] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const importInputRef = useRef(null);
  const currentYear = getTaipeiYear();

  // 用「整個自選清單」當 key，一次平行抓取所有個股詳情並快取整包結果。
  // 抓到後順手 mutate 各檔 api/stock/{code}，讓之後開啟個股視窗能命中同一份 SWR 快取。
  const swrKey =
    active && watchlist.length > 0 ? ["portfolio", ...watchlist] : null;

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

  const totals = useMemo(() => summarizePortfolioRows(rows), [rows]);

  const hasCustomizedPortfolio = useMemo(
    () =>
      watchlist.some(
        (code) =>
          (Object.prototype.hasOwnProperty.call(sharesMap, code) &&
            Number(sharesMap[code]) !== DEFAULT_SHARES) ||
          Object.prototype.hasOwnProperty.call(costMap, code)
      ),
    [watchlist, sharesMap, costMap]
  );

  useEffect(() => {
    if (!active) {
      setSubscriptionGuideOpen(false);
      setShowBackupReminder(false);
      return;
    }

    if (watchlist.length < 3 || !hasCustomizedPortfolio) {
      setShowBackupReminder(false);
      return;
    }

    try {
      setShowBackupReminder(
        window.localStorage.getItem(BACKUP_REMINDER_STORAGE_KEY) !== "1"
      );
    } catch {
      setShowBackupReminder(false);
    }
  }, [active, watchlist.length, hasCustomizedPortfolio]);

  const markBackupReminderHandled = () => {
    setShowBackupReminder(false);
    try {
      window.localStorage.setItem(BACKUP_REMINDER_STORAGE_KEY, "1");
    } catch {
      // 儲存不可用時仍讓提醒保持非阻斷，不影響主要功能。
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const result = await shareCard({
        year: currentYear,
        income: totals.income,
        yieldRate: totals.yieldRate,
        stockCount: watchlist.length,
        monthly: totals.monthly,
      });
      if (result === "downloaded") {
        addToast("成績單圖片已下載", "success");
      }
      trackEvent("share_card", { result });
    } catch (err) {
      console.error("Share card failed", err);
      trackEvent("share_card", { result: "error" });
      addToast("圖片產生失敗，請稍後再試", "error");
    } finally {
      setSharing(false);
    }
  };

  const handleExport = () => {
    try {
      const blob = new Blob([onExportData()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ugoodly-watchlist-backup.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      trackEvent("backup_export", { result: "success" });
      addToast("自選股備份已下載", "success");
      return true;
    } catch (error) {
      trackEvent("backup_export", { result: "error" });
      addToast("備份匯出失敗，請稍後再試", "error");
      return false;
    }
  };

  const handleBackupReminderExport = () => {
    if (handleExport()) markBackupReminderHandled();
  };

  const handleSubscribe = async () => {
    const result = await subscribeToCalendar(
      watchlist,
      addToast,
      variant === "page" ? "portfolio_page" : "portfolio_modal"
    );
    if (result === "copied") setSubscriptionGuideOpen(true);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = onImportData(await file.text());
      if (result.ok) {
        addToast("備份匯入成功，已覆蓋目前自選資料", "success");
        markBackupReminderHandled();
      } else {
        addToast(`備份匯入失敗：${result.error}`, "error");
      }
    } catch (error) {
      addToast("無法讀取備份檔案", "error");
    } finally {
      event.target.value = "";
    }
  };

  const backupActions = (
    <>
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        <button
          type="button"
          onClick={handleExport}
          className="flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Download size={15} />
          匯出備份
        </button>
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          className="flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Upload size={15} />
          匯入還原
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="sr-only"
          aria-label="選擇 uGoodly 自選股備份檔案"
        />
      </div>
      <p className="mt-2 text-[11px] font-medium text-rose-500">
        匯入會覆蓋目前的自選股、持股張數與成本設定。
      </p>
    </>
  );

  if (!active) return null;

  const titleId = `portfolio-${variant}-title`;
  const content = (
      <div
        className={`flex flex-col rounded-xl border border-slate-200 bg-white ${
          variant === "page" ? "min-h-[32rem]" : "max-h-[88vh]"
        }`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600">
              <Wallet size={20} />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-black tracking-tight text-slate-900">
                我的存股組合
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {currentYear} 年已公告與估算領息 · 共 {watchlist.length} 檔
              </p>
            </div>
          </div>
          {variant === "modal" ? (
            <div className="flex items-center gap-1">
              <Link
                href="/portfolio"
                onClick={onClose}
                className="flex min-h-11 items-center rounded-lg px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                開啟完整頁
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                aria-label="關閉"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              回股利日曆
            </Link>
          )}
        </div>

        {showBackupReminder && (
          <aside
            className="border-b border-blue-200 bg-blue-50 px-4 py-3"
            aria-live="polite"
          >
            <p className="text-sm font-bold text-slate-800">先替存股設定留一份備份</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              你的自選股、持股張數與成本資料只存在此裝置。換裝置或清除瀏覽資料前，建議先下載備份。
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleBackupReminderExport}
                className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
              >
                立即匯出
              </button>
              <button
                type="button"
                onClick={markBackupReminderHandled}
                className="min-h-11 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                稍後
              </button>
            </div>
          </aside>
        )}

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center text-slate-400">
            <PiggyBank size={48} className="opacity-30" />
            <p className="font-medium">還沒有自選股</p>
            <p className="text-sm">
              先在日曆或個股視窗點愛心加入追蹤，再回來試算年領股息。
            </p>
            <button
              type="button"
              onClick={onAddSampleWatchlist}
              className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              試試看：一鍵加入 0056 / 00878 / 台積電（2330）
            </button>
            <div className="mt-3 border-t border-slate-200 pt-4">
              {backupActions}
            </div>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto">
            {/* 總覽卡片 */}
            <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <div className="text-[11px] font-semibold text-emerald-700">
                  {totals.estimateCount > 0 ? "已公告＋最近一次估算" : "今年已公告領息"}
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

              {totals.estimateCount > 0 && (
                <p className="col-span-2 text-[11px] leading-5 text-slate-500 sm:col-span-3">
                  {totals.estimateCount} 檔今年尚無配息資料，暫以最近一次事件估算；此數字不是完整全年預測。
                </p>
              )}

              {totals.income > 0 && !loading && (
                <div className="col-span-2 grid grid-cols-[1fr_auto] gap-2 sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:opacity-60"
                  >
                    {sharing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Share2 size={16} />
                    )}
                    分享我的存股成績單
                  </button>
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    aria-expanded={subscriptionGuideOpen}
                    title="複製訂閱連結，除息與入帳日自動同步到你的行事曆"
                    className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <CalendarPlus size={16} />
                    <span className="hidden sm:inline">訂閱行事曆</span>
                  </button>
                  {subscriptionGuideOpen && (
                    <div className="col-span-2 sm:col-span-3">
                      <CalendarSubscribeGuide
                        onClose={() => setSubscriptionGuideOpen(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 每月現金流 */}
            {totals.maxMonth > 0 && (
              <div className="border-b border-slate-200 p-4">
                <div id="portfolio-cash-flow-title" className="mb-2 text-xs font-semibold text-slate-500">
                  每月現金流分布
                </div>
                <p id="portfolio-cash-flow-summary" className="sr-only">
                  全年已公告與估算現金流共 ${formatMoney(totals.income)}，最高月份為
                  {MONTH_LABELS[totals.monthly.indexOf(totals.maxMonth)]} 月，金額
                  ${formatMoney(totals.maxMonth)}。
                </p>
                <div
                  role="img"
                  aria-labelledby="portfolio-cash-flow-title portfolio-cash-flow-summary"
                >
                  <div aria-hidden="true" className="flex items-end justify-between gap-1" style={{ height: 64 }}>
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
                  <div aria-hidden="true" className="mt-1 flex justify-between gap-1">
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
                <table className="sr-only">
                  <caption>每月已公告與估算現金流明細</caption>
                  <thead>
                    <tr><th scope="col">月份</th><th scope="col">已公告與估算現金流</th></tr>
                  </thead>
                  <tbody>
                    {totals.monthly.map((value, index) => (
                      <tr key={MONTH_LABELS[index]}>
                        <th scope="row">{MONTH_LABELS[index]} 月</th>
                        <td>${formatMoney(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                        <div className="text-[10px] text-slate-400">
                          {computed?.usedEstimate ? "最近一次估算領息" : "今年已公告領息"}
                        </div>
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

            <div className="border-t border-slate-200 px-4 py-4">
              {backupActions}
              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                成本價預設帶入最新收盤價，可自行改成你的實際買入均價，殖利率會即時換算為投報率。
                試算未計入交易成本與稅費，僅供參考；張數與成本設定僅儲存在此裝置瀏覽器。
              </p>
            </div>
          </div>
        )}
      </div>
  );

  if (variant === "page") return content;

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledby={titleId}
      contentClassName="max-w-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[88vh]"
    >
      {content}
    </ModalContainer>
  );
}
