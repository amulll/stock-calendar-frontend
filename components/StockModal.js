"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import AdUnit from "./AdUnit";
import ModalContainer from "./ModalContainer";
import {
  X,
  Heart,
  Banknote,
  ChevronRight,
  ExternalLink,
  CalendarPlus,
  Calendar,
} from "lucide-react";
import Loading from "./Loading";
import { startOfDay, parseISO } from "date-fns";
import { useToast } from "../hooks/useToast";
import {
  getCachedStockDetail,
  setCachedStockDetail,
} from "../lib/cache";

const GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/render";

export default function StockModal({
  isOpen,
  onClose,
  stockCode,
  apiUrl,
  isTracked,
  onToggleTrack,
  onHistoryDateClick,
}) {
  const [history, setHistory] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    if (!isOpen || !stockCode) return;

    let cancelled = false;
    const fetchStock = async () => {
      const cached = getCachedStockDetail(stockCode);
      if (cached) {
        setInfo(cached.info);
        setHistory(cached.history);
        return;
      }

      setLoading(true);
      setInfo(null);
      setHistory([]);
      try {
        const res = await axios.get(`${apiUrl}/api/stock/${stockCode}`);
        if (cancelled) return;
        const payload = {
          info: res.data.info,
          history: Array.isArray(res.data.history) ? res.data.history : [],
        };
        setInfo(payload.info);
        setHistory(payload.history);
        setCachedStockDetail(stockCode, payload);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch stock modal data", error);
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.error ||
          "無法載入個股資料，請稍後再試";
        addToast(message, "error");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStock();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, isOpen, stockCode, addToast]);

  const prioritizedHistory = useMemo(() => {
    const withDividend = history.filter(
      (item) =>
        Number(item.cash_dividend) > 0 || Number(item.stock_dividend) > 0
    );
    return withDividend.length ? withDividend : history;
  }, [history]);

  const currentEvent = useMemo(() => {
    if (!prioritizedHistory.length) return null;

    const upcoming = prioritizedHistory
      .map((item) => {
        if (!item.ex_date) return null;
        const date = parseISO(item.ex_date);
        return Number.isNaN(date) ? null : { ...item, exDateObj: date };
      })
      .filter(
        (item) => item && item.exDateObj >= today
      )
      .sort((a, b) => a.exDateObj - b.exDateObj);

    if (upcoming.length) {
      return upcoming[0];
    }

    return (
      [...prioritizedHistory]
        .filter((item) => item.ex_date)
        .sort(
          (a, b) => new Date(b.ex_date).getTime() - new Date(a.ex_date).getTime()
        )[0] || null
    );
  }, [prioritizedHistory, today]);

  const historicalRecords = useMemo(() => {
    return history.filter((item) => {
      const dateStr = item.pay_date || item.ex_date;
      if (!dateStr) return false;
      const parsed = parseISO(dateStr);
      if (Number.isNaN(parsed)) return false;
      return parsed < today;
    });
  }, [history, today]);

  const displayYield = useMemo(() => {
    if (!currentEvent || !info?.daily_price) return "--";
    const price = Number(info.daily_price);
    const dividend = Number(currentEvent.cash_dividend);
    if (!price || price <= 0) return "--";
    return ((dividend / price) * 100).toFixed(2);
  }, [currentEvent, info]);

  const displayMarket = useMemo(() => {
    if (!info?.market_type) return "—";
    return info.market_type === "TPEX" ? "櫃買" : "上市";
  }, [info]);

  const addToGoogleCalendar = () => {
    if (!currentEvent?.pay_date || !info) return;
    const start = currentEvent.pay_date.replace(/-/g, "");
    const end = new Date(currentEvent.pay_date);
    end.setDate(end.getDate() + 1);
    const endStr = end.toISOString().split("T")[0].replace(/-/g, "");

    const title = encodeURIComponent(
      `股利提醒 - ${info.stock_name} (${info.stock_code})`
    );
    const details = encodeURIComponent(
      `現金股利：${currentEvent.cash_dividend} 元\n除息日：${currentEvent.ex_date}`
    );

    const url = `${GOOGLE_CALENDAR_URL}?action=TEMPLATE&text=${title}&dates=${start}/${endStr}&details=${details}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadIcsFile = () => {
    if (!currentEvent?.pay_date || !info) return;
    const dateStr = currentEvent.pay_date.replace(/-/g, "");
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:股利提醒 - ${info.stock_name}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DESCRIPTION:現金股利：${currentEvent.cash_dividend} 元\\n除息日：${currentEvent.ex_date}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dividend_${info.stock_code}_${dateStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const renderSummary = () => {
    if (!info || !currentEvent) return null;

    return (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
        <p>
          <strong>
            {info.stock_name} ({info.stock_code})
          </strong>{" "}
          最新現金股利
          <strong className="ml-1">
            {Number(currentEvent.cash_dividend || 0).toFixed(2)} 元
          </strong>
        </p>
        <p>
          除息日：<strong>{currentEvent.ex_date || "尚未公布"}</strong>
        </p>
        <p>
          發放日：<strong>{currentEvent.pay_date || "尚未公布"}</strong>
        </p>
        {displayYield !== "--" && (
          <p>
            以最新收盤價{" "}
            <strong>{info.daily_price}</strong> 元計算，
            <strong className="text-amber-600 ml-1">{displayYield}%</strong> 殖利率。
          </p>
        )}
      </div>
    );
  };

  const renderHistory = () => {
    if (!historicalRecords.length) {
      return (
        <div className="text-center text-slate-400 text-sm py-2">
          尚無歷史紀錄
        </div>
      );
    }

    return historicalRecords.map((item) => (
      <div
        key={`${item.stock_code}-${item.ex_date}-${item.pay_date}`}
        onClick={() => onHistoryDateClick(item.pay_date || item.ex_date)}
        className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-slate-50"
      >
        <div>
          <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition">
            發放日 {item.pay_date || "未提供"}
          </div>
          <div className="text-xs text-slate-400">除息日 {item.ex_date}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-bold text-slate-800">
            {Number(item.cash_dividend).toFixed(4)} 元
          </div>
          <ChevronRight
            size={14}
            className="text-slate-300 group-hover:text-blue-400"
          />
        </div>
      </div>
    ));
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="max-w-lg animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="relative border-b border-slate-200 bg-white p-4 text-slate-900">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-20 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="關閉"
          >
            <X size={20} />
          </button>

          <div className="flex items-start justify-between gap-3 pr-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  {info?.stock_name || stockCode}
                </h2>
                {stockCode && (
                  <Link
                    href={`/stock/${stockCode}`}
                    className="rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                    title="檢視個股頁面"
                  >
                    <ExternalLink size={16} />
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                {stockCode && (
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-sm font-bold text-slate-700">
                    {stockCode}
                  </span>
                )}
                <span className="text-sm">{displayMarket}</span>
              </div>
            </div>

            {stockCode && (
              <button
                onClick={() => onToggleTrack(stockCode)}
                className="mr-1 rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 active:scale-95"
                title={isTracked ? "移除追蹤" : "加入追蹤"}
              >
                <Heart
                  size={20}
                  className={isTracked ? "fill-rose-500 text-rose-500" : "text-slate-500"}
                />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loading text="載入個股資料中..." scale={0.4} />
            </div>
          ) : !info ? (
            <div className="text-center text-slate-500 py-12">
              暫時查無資料，請稍後再試。
            </div>
          ) : (
            <div className="space-y-4">
              {renderSummary()}

              <div className="mb-2 grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 mb-1">最新收盤價</div>
                  <div className="text-xl font-bold text-slate-700">
                    {info.daily_price ? `$${info.daily_price}` : "--"}
                  </div>
                </div>
                <div
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 ${
                    displayYield !== "--"
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div
                    className={`text-xs mb-1 ${
                      displayYield !== "--" ? "text-amber-700" : "text-slate-500"
                    }`}
                  >
                    估算殖利率
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      displayYield !== "--" ? "text-amber-700" : "text-slate-700"
                    }`}
                  >
                    {displayYield !== "--" ? `${displayYield}%` : "--"}
                  </div>
                </div>
              </div>

              {currentEvent && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    <Banknote size={18} /> 最新股利資訊
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        現金股利
                      </div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {Number(currentEvent.cash_dividend).toFixed(4)}{" "}
                        <span className="text-sm">元</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        發放日
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {currentEvent.pay_date || "尚未公布"}
                      </div>

                      {currentEvent.pay_date && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={addToGoogleCalendar}
                            className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-700 transition hover:bg-slate-100"
                          >
                            <CalendarPlus size={12} /> Google
                          </button>
                          <button
                            onClick={downloadIcsFile}
                            className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-700 transition hover:bg-slate-100"
                          >
                            <CalendarPlus size={12} /> iOS
                          </button>
                        </div>
                      )}

                      <div className="text-xs text-slate-400 mt-2">
                        除息日：{currentEvent.ex_date || "尚未公布"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                  <Calendar size={18} /> 歷史配息紀錄
                  <span className="text-xs font-normal text-slate-400 ml-auto">
                    （最新在前）
                  </span>
                </h3>
                <div className="space-y-2">{renderHistory()}</div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <AdUnit type="rectangle" />
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
