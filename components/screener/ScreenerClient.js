"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowDown, ArrowUp, Search } from "lucide-react";

// 選股組合 (preset)：一鍵套用的篩選條件
const PRESETS = [
  {
    id: "steady",
    label: "🛡️ 安心存股",
    hint: "連配 ≥10 年 · 填息率 ≥80%",
    filter: (r) => r.consecutive_years >= 10 && r.fill_rate >= 80,
  },
  {
    id: "monthly",
    label: "📅 月月現金流",
    hint: "季配以上高頻配息",
    filter: (r) => r.frequency === "月配" || r.frequency === "季配",
  },
  {
    id: "hot",
    label: "🔥 高息機會",
    hint: "殖利率 ≥6% · 尚有除息場次",
    filter: (r) => (r.annual_yield || 0) >= 6 && r.has_upcoming_ex,
  },
];

const COLUMNS = [
  { key: "stock_code", label: "代號 / 名稱", numeric: false },
  { key: "daily_price", label: "股價", numeric: true },
  { key: "annual_yield", label: "年殖利率", numeric: true },
  { key: "fill_rate", label: "填息率", numeric: true },
  { key: "consecutive_years", label: "連配年數", numeric: true },
  { key: "frequency", label: "頻率", numeric: false },
];

const FREQ_ORDER = { 月配: 5, 季配: 4, 半年配: 3, 年配: 2, 不定期: 1, 未知: 0 };
const PAGE_SIZE = 50;

function fmt(value, suffix = "") {
  if (value === null || value === undefined) return "--";
  return `${value}${suffix}`;
}

export default function ScreenerClient({ initialRows }) {
  const [preset, setPreset] = useState(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("annual_yield");
  const [sortDesc, setSortDesc] = useState(true);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const rows = useMemo(() => {
    let list = initialRows || [];

    const activePreset = PRESETS.find((p) => p.id === preset);
    if (activePreset) list = list.filter(activePreset.filter);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.stock_code.toLowerCase().includes(q) ||
          (r.stock_name || "").toLowerCase().includes(q)
      );
    }

    const direction = sortDesc ? -1 : 1;
    return [...list].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "frequency") {
        av = FREQ_ORDER[av] ?? 0;
        bv = FREQ_ORDER[bv] ?? 0;
      }
      // 空值永遠排最後，不受排序方向影響
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "string") return av.localeCompare(bv) * direction;
      return (av - bv) * direction;
    });
  }, [initialRows, preset, query, sortKey, sortDesc]);

  const visible = rows.slice(0, limit);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
    setLimit(PAGE_SIZE);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 md:p-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
          存股選股表
        </h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          全市場 {initialRows?.length || 0} 檔 · 依殖利率、填息率、連配年數排序篩選。
        </p>

        {/* 選股組合 + 搜尋 */}
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPreset((prev) => (prev === p.id ? null : p.id));
                  setLimit(PAGE_SIZE);
                }}
                title={p.hint}
                className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition ${
                  preset === p.id
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

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
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {preset && (
          <p className="mt-2 text-xs text-slate-500">
            {PRESETS.find((p) => p.id === preset)?.hint} · 符合 {rows.length} 檔
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
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
                      sortDesc ? (
                        <ArrowDown size={12} />
                      ) : (
                        <ArrowUp size={12} />
                      )
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
                    <Link
                      href={`/stock/${r.stock_code}`}
                      className="group flex items-center gap-2"
                    >
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
                      <span
                        className={`font-bold ${
                          r.annual_yield >= 6
                            ? "text-amber-600"
                            : "text-slate-800"
                        }`}
                      >
                        {r.annual_yield}%
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {r.total_ex_events > 0 ? fmt(r.fill_rate, "%") : "--"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {r.consecutive_years > 0 ? `${r.consecutive_years} 年` : "--"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                    {r.frequency}
                  </td>
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
            onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            顯示更多（還有 {rows.length - limit} 檔）
          </button>
        </div>
      )}
    </div>
  );
}
