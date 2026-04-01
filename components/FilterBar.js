"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, Heart, List, TrendingUp } from "lucide-react";

const MAX_SUGGESTIONS = 4;

export default function FilterBar({
  filterText,
  onFilterChange,
  suggestions,
  onSuggestionClick,
  showWatchlistOnly,
  onToggleWatchlistOnly,
  onOpenWatchlistModal,
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
  const watchlistMenuRef = useRef(null);
  const yieldMenuRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const controlId = useId();
  const inputId = `${controlId}-filter`;
  const labelId = `${controlId}-label`;
  const statusId = `${controlId}-status`;
  const listboxId = `${controlId}-listbox`;
  const watchlistMenuId = `${controlId}-watchlist-menu`;
  const yieldMenuId = `${controlId}-yield-menu`;

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
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <div className="sticky top-3 z-20 flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative flex-grow rounded-[28px] border border-slate-200/80 bg-slate-50/90 p-1.5 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.35)] backdrop-blur">
        <label htmlFor={inputId} id={labelId} className="sr-only">
          搜尋股票
        </label>
        <input
          type="text"
          id={inputId}
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="輸入股票代號或名稱..."
          className="w-full rounded-[22px] border border-transparent bg-white px-4 py-4 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-slate-400 focus:border-blue-200 focus:ring-4 focus:ring-blue-100"
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
        <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
          <Search className="text-slate-400" size={18} />
        </div>
        {filterText && (
          <button
            onClick={onClearFilter}
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="清除搜尋條件"
          >
            ×
          </button>
        )}
        {hasSuggestions && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="股票搜尋建議"
            className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.45)]"
          >
            {visibleSuggestions.map((stock, index) => (
              <li
                key={stock.stock_code}
                id={`stock-suggestion-${stock.stock_code}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={() => onSuggestionClick(stock)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between rounded-[18px] px-4 py-3 text-sm transition duration-100 ${
                  activeIndex === index ? "bg-blue-50/90" : "hover:bg-slate-50"
                }`}
              >
                <span className="font-mono text-base font-bold text-slate-800">
                  {stock.stock_code}
                </span>
                <span className="ml-2 truncate text-slate-600">
                  {stock.stock_name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2 self-end xl:self-auto">
        <div className="relative" ref={watchlistMenuRef}>
          <button
            onClick={() => setWatchlistMenuOpen((open) => !open)}
            className={`flex min-w-[5.25rem] items-center justify-center gap-2 rounded-[24px] border px-4 py-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.35)] transition ${
              showWatchlistOnly
                ? "border-rose-300 bg-rose-500 text-white shadow-rose-200"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            title="僅顯示自選股"
            aria-pressed={showWatchlistOnly}
            aria-haspopup="menu"
            aria-expanded={watchlistMenuOpen}
            aria-controls={watchlistMenuOpen ? watchlistMenuId : undefined}
            aria-label={showWatchlistOnly ? "顯示全部股票" : "僅顯示自選股"}
          >
            <Heart size={20} className={showWatchlistOnly ? "fill-white" : ""} />
            <span className="hidden text-[10px] font-black uppercase tracking-[0.16em] sm:inline">
              自選
            </span>
          </button>

          {watchlistMenuOpen && (
            <div
              id={watchlistMenuId}
              className="absolute right-0 top-full z-30 mt-3 w-64 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.45)] animate-in fade-in zoom-in-95 duration-200"
              role="menu"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500/70">
                Watchlist
              </p>
              <div className="mb-4 mt-3 flex items-center justify-between rounded-[22px] bg-rose-50 px-4 py-3">
                <span className="text-sm font-bold text-slate-700">
                  僅顯示自選股
                </span>
                <button
                  onClick={() => {
                    onToggleWatchlistOnly();
                    setWatchlistMenuOpen(false);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showWatchlistOnly ? "bg-rose-500" : "bg-slate-200"
                  }`}
                  aria-label="切換自選股篩選"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      showWatchlistOnly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={() => {
                  onOpenWatchlistModal();
                  setWatchlistMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                role="menuitem"
              >
                <List size={16} />
                管理自選清單
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={yieldMenuRef}>
          <button
            onClick={() => setYieldMenuOpen((open) => !open)}
            className={`flex min-w-[6.75rem] items-center justify-center gap-2 rounded-[24px] border px-4 py-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.35)] transition ${
              showHighYieldOnly
                ? "border-amber-300 bg-amber-500 text-white shadow-amber-200"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            title="高殖利率篩選"
            aria-pressed={showHighYieldOnly}
            aria-haspopup="menu"
            aria-expanded={yieldMenuOpen}
            aria-controls={yieldMenuOpen ? yieldMenuId : undefined}
            aria-label={
              showHighYieldOnly ? "顯示全部殖利率" : "僅顯示高殖利率股票"
            }
          >
            <TrendingUp size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.16em]">
              &gt;{localYield}%
            </span>
          </button>

          {yieldMenuOpen && (
            <div
              id={yieldMenuId}
              className="absolute right-0 top-full z-30 mt-3 w-72 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.45)] animate-in fade-in zoom-in-95 duration-200"
              role="menu"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500/80">
                Yield Filter
              </p>
              <div className="mb-4 mt-3 flex items-center justify-between rounded-[22px] bg-amber-50 px-4 py-3">
                <span className="text-sm font-bold text-slate-700">
                  高殖利率篩選
                </span>
                <button
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
              <div className="mb-4 rounded-[22px] bg-slate-50 px-4 py-4">
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
                onClick={() => {
                  onOpenYieldList();
                  setYieldMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                role="menuitem"
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
