"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowDown, ArrowUp, Search, X } from "lucide-react";

// 空白條件當作起點；preset 只是把這些欄位一次填好，使用者可再自行微調
const EMPTY = {
  yieldMin: "",
  fillMin: "",
  yearsMin: "",
  freqs: [],
  markets: [],
  upcomingOnly: false,
};

const PRESETS = [
  { id: "steady", label: "🛡️ 長期配息條件", values: { ...EMPTY, yearsMin: "10", fillMin: "80" } },
  { id: "monthly", label: "📅 月月現金流", values: { ...EMPTY, freqs: ["月配", "季配"] } },
  { id: "hot", label: "🔥 今年已公告高殖利率", values: { ...EMPTY, yieldMin: "6", upcomingOnly: true } },
];

const FREQ_OPTIONS = ["月配", "季配", "半年配", "年配"];
const MARKET_OPTIONS = ["上市", "上櫃"];

const COLUMNS = [
  { key: "stock_code", label: "代號 / 名稱" },
  { key: "daily_price", label: "股價" },
  { key: "annual_yield", label: "今年已公告殖利率" },
  { key: "next_pay_date", label: "下次股利發放日" },
  { key: "fill_rate", label: "填息率" },
  { key: "consecutive_years", label: "連配年數" },
  { key: "frequency", label: "頻率" },
];

const FREQ_ORDER = { 月配: 5, 季配: 4, 半年配: 3, 年配: 2, 不定期: 1, 未知: 0 };
const PAGE_SIZE = 50;

function normalizeMarket(m) {
  if (!m) return null;
  return m.includes("櫃") || m.toUpperCase().includes("TPEX") || m === "otc" ? "上櫃" : "上市";
}
function num(str) {
  const n = parseFloat(str);
  return Number.isNaN(n) ? 0 : n;
}

function evaluatedFillCount(row) {
  return row.evaluated_fill_events ?? row.total_ex_events ?? 0;
}

function formatShortDate(value) {
  return value ? value.slice(5).replace("-", "/") : "—";
}

export default function ScreenerClient({ initialRows }) {
  const [filters, setFilters] = useState(EMPTY);
  const [activePreset, setActivePreset] = useState(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("annual_yield");
  const [sortDesc, setSortDesc] = useState(true);
  const [limit, setLimit] = useState(PAGE_SIZE);

  // 任何手動改動都清掉 preset 高亮，並回到第一頁
  const patch = (next) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setActivePreset(null);
    setLimit(PAGE_SIZE);
  };
  const applyPreset = (p) => {
    if (activePreset === p.id) {
      // 再點一次取消
      setFilters(EMPTY);
      setActivePreset(null);
    } else {
      setFilters(p.values);
      setActivePreset(p.id);
    }
    setLimit(PAGE_SIZE);
  };
  const toggleIn = (key, value) => {
    const set = new Set(filters[key]);
    set.has(value) ? set.delete(value) : set.add(value);
    patch({ [key]: [...set] });
  };
  const clearAll = () => {
    setFilters(EMPTY);
    setActivePreset(null);
    setQuery("");
    setLimit(PAGE_SIZE);
  };

  const isDefault =
    !query &&
    !filters.yieldMin &&
    !filters.fillMin &&
    !filters.yearsMin &&
    filters.freqs.length === 0 &&
    filters.markets.length === 0 &&
    !filters.upcomingOnly;

  const rows = useMemo(() => {
    const yMin = num(filters.yieldMin);
    const fMin = num(filters.fillMin);
    const cMin = num(filters.yearsMin);
    const q = query.trim().toLowerCase();

    let list = (initialRows || []).filter((r) => {
      if (yMin > 0 && !((r.annual_yield || 0) >= yMin)) return false;
      if (fMin > 0 && !(evaluatedFillCount(r) > 0 && r.fill_rate >= fMin)) return false;
      if (cMin > 0 && r.consecutive_years < cMin) return false;
      if (filters.freqs.length && !filters.freqs.includes(r.frequency)) return false;
      if (filters.markets.length && !filters.markets.includes(normalizeMarket(r.market_type)))
        return false;
      if (filters.upcomingOnly && !r.has_upcoming_ex) return false;
      if (q && !(r.stock_code.toLowerCase().includes(q) || (r.stock_name || "").toLowerCase().includes(q)))
        return false;
      return true;
    });

    const dir = sortDesc ? -1 : 1;
    return list.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "frequency") {
        av = FREQ_ORDER[av] ?? 0;
        bv = FREQ_ORDER[bv] ?? 0;
      }
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }, [initialRows, filters, query, sortKey, sortDesc]);

  const visible = rows.slice(0, limit);

  const handleSort = (key) => {
    if (sortKey === key) setSortDesc((v) => !v);
    else {
      setSortKey(key);
      setSortDesc(key !== "next_pay_date");
    }
    setLimit(PAGE_SIZE);
  };

  const numField = (label, key, suffix) => (
    <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400">
      {label} ≥
      <input
        type="text"
        inputMode="decimal"
        value={filters[key]}
        onChange={(e) => patch({ [key]: e.target.value.replace(/[^\d.]/g, "") })}
        placeholder="—"
        className="w-12 bg-transparent text-right font-mono text-sm font-bold text-slate-800 outline-none"
      />
      <span className="text-slate-400">{suffix}</span>
    </label>
  );

  const chip = (active, onClick, children, key) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4 md:p-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">存股選股表</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          全市場 {initialRows?.length || 0} 檔 · 套用選股組合當起點，再自由微調條件。
        </p>

        {/* 選股組合 (起點) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) =>
            chip(activePreset === p.id, () => applyPreset(p), p.label, p.id)
          )}
        </div>

        {/* 可調條件 */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {numField("已公告殖利率", "yieldMin", "%")}
          {numField("填息率", "fillMin", "%")}
          {numField("連配", "yearsMin", "年")}
          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
          {FREQ_OPTIONS.map((f) =>
            chip(filters.freqs.includes(f), () => toggleIn("freqs", f), f, `f-${f}`)
          )}
          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
          {MARKET_OPTIONS.map((m) =>
            chip(filters.markets.includes(m), () => toggleIn("markets", m), m, `m-${m}`)
          )}
          {chip(filters.upcomingOnly, () => patch({ upcomingOnly: !filters.upcomingOnly }), "今年還有除息", "upc")}
        </div>

        {/* 搜尋 + 結果數 + 清除 */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="搜尋代號或名稱..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-200 md:w-56"
            />
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>符合 <strong className="text-slate-800">{rows.length}</strong> 檔</span>
            {!isDefault && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={13} /> 清除條件
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className={`inline-flex items-center gap-1 transition hover:text-slate-900 ${
                      sortKey === col.key ? "text-slate-900" : ""
                    }`}
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDesc ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-12 text-center text-slate-400">
                  沒有符合條件的股票
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.stock_code} className="transition hover:bg-slate-50">
                  <td className="px-3 py-2.5">
                    <Link href={`/stock/${r.stock_code}`} className="group flex items-center gap-2">
                      <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-700">
                        {r.stock_code}
                      </span>
                      <span className="font-medium text-slate-800 group-hover:text-blue-600">
                        {r.stock_name || "—"}
                      </span>
                      {r.has_upcoming_ex && (
                        <span className="rounded bg-amber-50 px-1 py-0.5 text-[10px] font-bold text-amber-600">
                          將除息
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-700">
                    {r.daily_price ? `$${r.daily_price}` : "--"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {r.annual_yield !== null && r.annual_yield !== undefined ? (
                      <span className={`font-bold ${r.annual_yield >= 6 ? "text-amber-600" : "text-slate-800"}`}>
                        {r.annual_yield}%
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-700">
                    {r.next_pay_date ? (
                      <time dateTime={r.next_pay_date}>{formatShortDate(r.next_pay_date)}</time>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {evaluatedFillCount(r) > 0 ? `${r.fill_rate}%` : "--"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {r.consecutive_years > 0 ? `${r.consecutive_years} 年` : "--"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{r.frequency}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > limit && (
        <div className="border-t border-slate-200 p-3 text-center">
          <button
            type="button"
            onClick={() => setLimit((v) => v + PAGE_SIZE)}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            顯示更多（還有 {rows.length - limit} 檔）
          </button>
        </div>
      )}
    </div>
  );
}
