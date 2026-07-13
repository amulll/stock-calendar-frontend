// ETF 收益分配組成堆疊條。突顯「收益平準金」——它越高代表越多配息來自本金而非真實收益。
// 綠系 = 實際收益（股利/利息/資本利得）；琥珀 = 平準金（本金）；灰 = 其他。

const SEGMENTS = [
  { key: "dividend", label: "股利所得", color: "#059669" },
  { key: "interest", label: "利息所得", color: "#0d9488" },
  { key: "capital_gain", label: "資本利得", color: "#2563eb" },
  { key: "capital_levy", label: "收益平準金", color: "#d97706", flag: true },
  { key: "other", label: "其他", color: "#94a3b8" },
];

export default function IncomeCompositionBar({ composition, exDate }) {
  if (!composition) return null;

  const levy = Number(composition.capital_levy || 0);
  const segments = SEGMENTS.map((s) => ({
    ...s,
    pct: Number(composition[s.key] || 0),
  })).filter((s) => s.pct > 0);

  if (segments.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-black tracking-tight text-slate-900">
          本次配息組成
        </h2>
        {exDate && <span className="text-xs text-slate-400">除息日 {exDate}</span>}
      </div>

      {/* 堆疊條 */}
      <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map((s) => (
          <div
            key={s.key}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            title={`${s.label} ${s.pct}%`}
          />
        ))}
      </div>

      {/* 圖例 */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className={s.flag ? "font-bold text-amber-700" : "text-slate-600"}>
              {s.label}
            </span>
            <span className="font-mono font-semibold text-slate-800">{s.pct}%</span>
          </span>
        ))}
      </div>

      {/* 白話判讀 */}
      <p
        className={`mt-3 rounded-md border px-3 py-2 text-xs leading-5 ${
          levy >= 30
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-slate-50 text-slate-600"
        }`}
      >
        {levy >= 30 ? (
          <>
            本次配息約 <strong>{levy}%</strong> 來自「收益平準金」——這部分等於是把你自己的本金配還給你，
            並非基金真正賺到的收益。高殖利率若大量來自平準金，需留意是否為「配息吃本金」。
          </>
        ) : (
          <>
            本次配息主要來自實際收益（股利、利息、資本利得），收益平準金占比{" "}
            <strong>{levy}%</strong>，相對健康。組成資料來自證交所 ETF e添富，僅供參考。
          </>
        )}
      </p>
    </section>
  );
}
