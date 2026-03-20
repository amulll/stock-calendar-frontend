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
    <div className="sticky top-2 md:top-6 z-20 mb-4 flex gap-2 relative items-center">
      <div className="relative flex-grow">
        <label htmlFor={inputId} id={labelId} className="sr-only">
          搜尋股票
        </label>
        <input
          type="text"
          id={inputId}
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="輸入股票代號或名稱..."
          className="w-full p-3 pl-10 border border-blue-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
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
        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
        {filterText && (
          <button
            onClick={onClearFilter}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
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
            className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
          >
            {visibleSuggestions.map((stock, index) => (
              <li
                key={stock.stock_code}
                id={`stock-suggestion-${stock.stock_code}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={() => onSuggestionClick(stock)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`p-3 cursor-pointer transition duration-100 flex justify-between items-center text-sm border-b border-slate-50 last:border-0 ${
                  activeIndex === index ? "bg-blue-50/80" : "hover:bg-blue-50/50"
                }`}
              >
                <span className="font-bold text-slate-800 font-mono text-base">
                  {stock.stock_code}
                </span>
                <span className="text-slate-600 truncate ml-2">
                  {stock.stock_name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative" ref={watchlistMenuRef}>
          <button
            onClick={() => setWatchlistMenuOpen((open) => !open)}
            className={`p-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1 min-w-[3.5rem] ${
              showWatchlistOnly
                ? "bg-rose-500 text-white shadow-rose-200 ring-2 ring-rose-300"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
            title="僅顯示自選股"
            aria-pressed={showWatchlistOnly}
            aria-haspopup="menu"
            aria-expanded={watchlistMenuOpen}
            aria-controls={watchlistMenuOpen ? watchlistMenuId : undefined}
            aria-label={showWatchlistOnly ? "顯示全部股票" : "僅顯示自選股"}
          >
            <Heart size={20} className={showWatchlistOnly ? "fill-white" : ""} />
          </button>

          {watchlistMenuOpen && (
            <div
              id={watchlistMenuId}
              className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-200"
              role="menu"
            >
              <div className="flex items-center justify-between mb-4">
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
                className="w-full py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
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
            className={`p-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1 min-w-[4.5rem] ${
              showHighYieldOnly
                ? "bg-amber-500 text-white shadow-amber-200 ring-2 ring-amber-300"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
            <span className="font-bold text-sm">&gt;{localYield}%</span>
          </button>

          {yieldMenuOpen && (
            <div
              id={yieldMenuId}
              className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-200"
              role="menu"
            >
              <div className="flex items-center justify-between mb-4">
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
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
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
                className="w-full py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
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
