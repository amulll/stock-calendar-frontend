"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, Heart, List, TrendingUp, X, CalendarPlus } from "lucide-react";
import CalendarSubscribeGuide from "./CalendarSubscribeGuide";

const MAX_SUGGESTIONS = 4;

export default function FilterBar({
  filterText,
  onFilterChange,
  suggestions,
  onSuggestionClick,
  watchlistSet,
  onSuggestionWatchlistToggle,
  showWatchlistOnly,
  onToggleWatchlistOnly,
  onOpenWatchlistModal,
  watchlistCount,
  onSubscribeCalendar,
  showHighYieldOnly,
  onToggleHighYieldOnly,
  localYield,
  onLocalYieldChange,
  onCommitYield,
  onOpenYieldList,
  onClearFilter,
}) {
  const [watchlistMenuOpen, setWatchlistMenuOpen] = useState(false);
  const [yieldMenuOpen, setYieldMenuOpen] = useState(false);
  const [subscriptionGuideOpen, setSubscriptionGuideOpen] = useState(false);
  const [subscriptionPending, setSubscriptionPending] = useState(false);
  const watchlistMenuRef = useRef(null);
  const yieldMenuRef = useRef(null);
  const subscriptionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const controlId = useId();
  const inputId = `${controlId}-filter`;
  const labelId = `${controlId}-label`;
  const statusId = `${controlId}-status`;
  const listboxId = `${controlId}-listbox`;
  const watchlistMenuId = `${controlId}-watchlist-menu`;
  const yieldMenuId = `${controlId}-yield-menu`;
  const subscriptionGuideId = `${controlId}-subscription-guide`;
  const watchlistHeadingId = `${controlId}-watchlist-heading`;
  const yieldHeadingId = `${controlId}-yield-heading`;

  const visibleSuggestions = suggestions.slice(0, MAX_SUGGESTIONS);
  const hasSuggestions = visibleSuggestions.length > 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        watchlistMenuRef.current &&
        !watchlistMenuRef.current.contains(event.target)
      ) {
        setWatchlistMenuOpen(false);
      }
      if (yieldMenuRef.current && !yieldMenuRef.current.contains(event.target)) {
        setYieldMenuOpen(false);
      }
      if (
        subscriptionRef.current &&
        !subscriptionRef.current.contains(event.target)
      ) {
        setSubscriptionGuideOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") return;
      setWatchlistMenuOpen(false);
      setYieldMenuOpen(false);
      setSubscriptionGuideOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [filterText, suggestions]);

  const handleKeyDown = (event) => {
    if (!hasSuggestions) return;
    const max = visibleSuggestions.length;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % max);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? max - 1 : prev - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      onSuggestionClick(visibleSuggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setActiveIndex(-1);
    }
  };

  const statusMessage = hasSuggestions
    ? `有 ${visibleSuggestions.length} 筆建議，可用方向鍵瀏覽`
    : filterText
    ? "找不到符合的建議"
    : "請輸入股票代號或名稱";

  const handleSubscribe = async () => {
    if (subscriptionPending) return;
    setSubscriptionPending(true);
    try {
      const result = await onSubscribeCalendar();
      setSubscriptionGuideOpen(result === "copied");
    } finally {
      setSubscriptionPending(false);
    }
  };

  return (
    <div className="sticky top-3 z-40 flex flex-col gap-2 xl:flex-row xl:items-center">
      <div className="relative flex-grow rounded-xl border border-slate-200 bg-white">
        <label htmlFor={inputId} id={labelId} className="sr-only">
          搜尋股票
        </label>
        <input
          type="text"
          id={inputId}
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="輸入股票代號或名稱..."
          className="w-full rounded-xl border border-transparent bg-white px-4 py-3 pl-11 pr-12 text-sm font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={hasSuggestions ? listboxId : undefined}
          aria-expanded={hasSuggestions}
          aria-activedescendant={
            activeIndex >= 0
              ? `stock-suggestion-${visibleSuggestions[activeIndex]?.stock_code}`
              : undefined
          }
          aria-labelledby={labelId}
          aria-describedby={statusId}
          autoComplete="off"
          onKeyDown={handleKeyDown}
        />
        <span id={statusId} role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </span>
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <Search className="text-slate-400" size={18} />
        </div>
        {filterText && (
          <button
            type="button"
            onClick={onClearFilter}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="清除搜尋條件"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
        {hasSuggestions && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="股票搜尋建議"
            className="absolute left-0 right-0 z-[90] mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          >
            {visibleSuggestions.map((stock, index) => (
              <li
                key={stock.stock_code}
                id={`stock-suggestion-${stock.stock_code}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={() => onSuggestionClick(stock)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition duration-100 ${
                  activeIndex === index ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <span className="flex min-w-0 items-center">
                  <span className="font-mono text-base font-bold text-slate-800">
                    {stock.stock_code}
                  </span>
                  <span className="ml-2 truncate text-slate-600">
                    {stock.stock_name}
                  </span>
                </span>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSuggestionWatchlistToggle(stock);
                  }}
                  className={`ml-3 min-h-11 flex-shrink-0 rounded-md border px-2 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    watchlistSet.has(stock.stock_code)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                  }`}
                  aria-label={`${
                    watchlistSet.has(stock.stock_code) ? "移出" : "加入"
                  }自選：${stock.stock_code} ${stock.stock_name || ""}`}
                >
                  {watchlistSet.has(stock.stock_code) ? "✓ 已加入" : "＋ 加入"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex w-full flex-wrap gap-2 self-end sm:w-auto xl:self-auto">
        <div className="relative" ref={watchlistMenuRef}>
          <button
            type="button"
            onClick={() => setWatchlistMenuOpen((open) => !open)}
            className={`flex min-h-11 min-w-[5.25rem] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
              showWatchlistOnly
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            title="僅顯示自選股"
            aria-pressed={showWatchlistOnly}
            aria-haspopup="dialog"
            aria-expanded={watchlistMenuOpen}
            aria-controls={watchlistMenuOpen ? watchlistMenuId : undefined}
            aria-label={showWatchlistOnly ? "顯示全部股票" : "僅顯示自選股"}
          >
            <Heart size={18} className={showWatchlistOnly ? "fill-rose-600" : ""} />
            <span className="hidden sm:inline">
              自選
            </span>
          </button>

          {watchlistMenuOpen && (
            <>
              <button
                type="button"
                tabIndex={-1}
                className="fixed inset-0 z-[80] bg-slate-900/30 backdrop-blur-[1px] md:hidden"
                aria-label="關閉自選股選單"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setWatchlistMenuOpen(false);
                }}
              />
              <div
                id={watchlistMenuId}
                className="fixed left-1/2 top-1/2 z-[90] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-64 md:max-w-[calc(100vw-2rem)] md:translate-x-0 md:translate-y-0"
                role="dialog"
                aria-modal="false"
                aria-labelledby={watchlistHeadingId}
              >
                <div className="flex min-h-11 items-center justify-between gap-3">
                  <p
                    id={watchlistHeadingId}
                    className="text-sm font-bold text-slate-700 md:text-xs md:font-semibold md:text-slate-500"
                  >
                    自選股
                  </p>
                  <button
                    type="button"
                    onClick={() => setWatchlistMenuOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 md:hidden"
                    aria-label="關閉自選股選單"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
                <div className="mb-3 mt-2 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2.5">
                  <span className="text-sm font-bold text-slate-700">
                    僅顯示自選股
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleWatchlistOnly();
                      setWatchlistMenuOpen(false);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    aria-label="切換自選股篩選"
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showWatchlistOnly ? "bg-rose-500" : "bg-slate-200"
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                          showWatchlistOnly ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenWatchlistModal();
                    setWatchlistMenuOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <List size={16} aria-hidden="true" />
                  管理自選清單
                </button>
              </div>
            </>
          )}
        </div>

        <div className="relative flex-1 sm:flex-none" ref={subscriptionRef}>
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={subscriptionPending}
            aria-expanded={subscriptionGuideOpen}
            aria-controls={subscriptionGuideOpen ? subscriptionGuideId : undefined}
            title={
              watchlistCount === 0
                ? "先加入自選股，即可訂閱發放日"
                : "訂閱自選股發放日到行事曆"
            }
            className="flex min-h-11 w-full min-w-[6rem] items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 sm:w-auto"
          >
            <CalendarPlus size={18} aria-hidden="true" />
            <span className="sm:hidden">
              {subscriptionPending ? "處理中" : "訂閱"}
            </span>
            <span className="hidden sm:inline">
              {subscriptionPending ? "處理中" : "訂閱行事曆"}
            </span>
          </button>

          {subscriptionGuideOpen && (
            <>
              <button
                type="button"
                tabIndex={-1}
                className="fixed inset-0 z-[80] bg-slate-900/30 backdrop-blur-[1px] md:hidden"
                aria-label="關閉行事曆訂閱教學"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setSubscriptionGuideOpen(false);
                }}
              />
              <div
                id={subscriptionGuideId}
                className="fixed left-1/2 top-1/2 z-[90] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-96 md:max-w-[calc(100vw-2rem)] md:translate-x-0 md:translate-y-0"
              >
                <CalendarSubscribeGuide
                  onClose={() => setSubscriptionGuideOpen(false)}
                />
              </div>
            </>
          )}
        </div>

        <div className="relative flex-1 sm:flex-none" ref={yieldMenuRef}>
          <button
            type="button"
            onClick={() => setYieldMenuOpen((open) => !open)}
            className={`flex min-h-11 min-w-[6.75rem] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
              showHighYieldOnly
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            title="高殖利率篩選"
            aria-pressed={showHighYieldOnly}
            aria-haspopup="dialog"
            aria-expanded={yieldMenuOpen}
            aria-controls={yieldMenuOpen ? yieldMenuId : undefined}
            aria-label={
              showHighYieldOnly ? "顯示全部殖利率" : "僅顯示高殖利率股票"
            }
          >
            <TrendingUp size={18} />
            <span>
              &gt;{localYield}%
            </span>
          </button>

          {yieldMenuOpen && (
            <div
              id={yieldMenuId}
              className="absolute right-0 top-full z-[90] mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
              role="dialog"
              aria-modal="false"
              aria-labelledby={yieldHeadingId}
            >
              <p
                id={yieldHeadingId}
                className="text-xs font-semibold text-slate-500"
              >
                殖利率篩選
              </p>
              <div className="mb-3 mt-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5">
                <span className="text-sm font-bold text-slate-700">
                  高殖利率篩選
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onToggleHighYieldOnly();
                    setYieldMenuOpen(false);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showHighYieldOnly ? "bg-amber-500" : "bg-slate-200"
                  }`}
                  aria-label="切換高殖利率篩選"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      showHighYieldOnly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="mb-3 rounded-lg bg-slate-50 px-3 py-3">
                <div className="mb-2 flex justify-between text-xs text-slate-500">
                  <span>殖利率門檻</span>
                  <span className="font-bold text-amber-600">{localYield}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={localYield}
                  onChange={(e) => onLocalYieldChange(Number(e.target.value))}
                  onMouseUp={() => onCommitYield(localYield)}
                  onTouchEnd={() => onCommitYield(localYield)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  aria-label="調整殖利率門檻"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1%</span>
                  <span>20%</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenYieldList();
                  setYieldMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                <List size={16} />
                檢視高殖利率清單
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
