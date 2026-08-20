import Link from "next/link";
import { ArrowLeft, ListFilter } from "lucide-react";

import RankingLandingTracker from "./RankingLandingTracker";

const MIN_FILL_SAMPLE = 5;

const CONFIG = {
  "fill-rate": {
    eyebrow: "歷史填息研究",
    title: "台股歷史填息率排名",
    intro: `僅列入至少 ${MIN_FILL_SAMPLE} 次已完成觀察的除息事件，並同時呈現成功次數與樣本數。`,
    methodology: `填息成功率 = 成功填息事件 ÷ 已評估事件。已評估事件包含成功填息與逾觀察期未填息；觀察中或尚未計算不進分母。平均填息天數只計成功事件。最低 ${MIN_FILL_SAMPLE} 筆是本頁的保守展示門檻，不代表統計顯著性。`,
    columns: ["填息成功率", "成功／已評估", "成功事件平均天數", "涵蓋事件"],
    filter: (row) => Number(row.evaluated_fill_events) >= MIN_FILL_SAMPLE,
    sort: (a, b) =>
      Number(b.fill_rate) - Number(a.fill_rate) ||
      Number(a.avg_fill_days) - Number(b.avg_fill_days) ||
      Number(b.evaluated_fill_events) - Number(a.evaluated_fill_events),
    cells: (row) => [
      `${Number(row.fill_rate || 0).toFixed(1)}%`,
      `${Number(row.successful_fill_events || 0)} / ${Number(row.evaluated_fill_events || 0)}`,
      Number(row.successful_fill_events) > 0
        ? `${Number(row.avg_fill_days || 0).toFixed(1)} 天`
        : "—",
      `${Number(row.evaluated_fill_events || 0)} / ${Number(row.total_ex_events || 0)}`,
    ],
  },
  "consecutive-dividend": {
    eyebrow: "配息延續性研究",
    title: "台股連續配息年數排名",
    intro: "依本站已儲存的正現金或股票股利事件，整理從最近配息年度往前連續出現的年數。",
    methodology: "以除權息日年度去重，從資料中的最近配息年度逐年往前計數，遇到缺年即停止。這是本站歷史資料的連續性描述，不代表公司承諾，也不預測未來配息。",
    columns: ["連續配息年數", "最近年度頻率", "歷史除權息事件", "今年已公告現金股利"],
    filter: (row) => Number(row.consecutive_years) > 0,
    sort: (a, b) =>
      Number(b.consecutive_years) - Number(a.consecutive_years) ||
      Number(b.total_ex_events) - Number(a.total_ex_events),
    cells: (row) => [
      `${Number(row.consecutive_years || 0)} 年`,
      row.frequency || "未知",
      `${Number(row.total_ex_events || 0)} 次`,
      `${Number(row.annual_cash || 0).toFixed(3)} 元`,
    ],
  },
  "high-yield": {
    eyebrow: "今年已公告資料",
    title: "台股今年已公告殖利率排名",
    intro: "以今年已入庫的現金股利合計除以最近收盤價；年初與公告季期間資料通常尚未完整。",
    methodology: "今年已公告殖利率 = 當年度已入庫現金股利合計 ÷ 最新儲存收盤價。只列出已有正現金股利且有有效價格的股票；不加入尚未公告的配息，因此不是預估或遠期殖利率。不同公司的公告時點不同，季節中排名尤其不可視為全年比較。",
    columns: ["今年已公告殖利率", "今年已公告現金股利", "最近收盤價", "歷史配息頻率"],
    filter: (row) => Number(row.annual_cash) > 0 && row.annual_yield != null,
    sort: (a, b) => Number(b.annual_yield) - Number(a.annual_yield),
    cells: (row) => [
      `${Number(row.annual_yield || 0).toFixed(2)}%`,
      `${Number(row.annual_cash || 0).toFixed(3)} 元`,
      row.daily_price ? `${Number(row.daily_price).toFixed(2)} 元` : "—",
      row.frequency || "未知",
    ],
  },
};

function maintenanceLabel(rows) {
  const latest = rows.reduce((result, row) => {
    const timestamp = row.data_maintained_at;
    return timestamp && (!result || timestamp > result) ? timestamp : result;
  }, null);
  if (!latest) return "尚未提供";
  const parsed = new Date(latest);
  if (Number.isNaN(parsed.getTime())) return "尚未提供";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

export default function RankingPage({ type, rows }) {
  const config = CONFIG[type];
  const rankedRows = rows.filter(config.filter).sort(config.sort).slice(0, 100);

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 md:px-8 md:py-7">
      <RankingLandingTracker rankingType={type} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/screener"
            className="inline-flex min-h-11 items-center text-sm font-bold text-slate-600 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
            回存股選股表
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            我的存股組合
          </Link>
        </div>

        <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
          <p className="text-xs font-black tracking-[0.14em] text-blue-700">
            {config.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            {config.title}
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            {config.intro}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>顯示 {rankedRows.length} 檔（最多 100 檔）</span>
            <span>本站資料維護日：{maintenanceLabel(rows)}</span>
          </div>
        </header>

        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {rankedRows.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-slate-500">
              目前沒有符合本頁樣本條件的資料，請稍後再查看。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
                  <tr>
                    <th className="px-3 py-3 text-center" scope="col">排名</th>
                    <th className="px-3 py-3" scope="col">股票</th>
                    {config.columns.map((column) => (
                      <th key={column} className="px-3 py-3 text-right" scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankedRows.map((row, index) => (
                    <tr key={row.stock_code} className="hover:bg-slate-50">
                      <td className="px-3 py-3 text-center font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <th className="px-3 py-3" scope="row">
                        <Link
                          href={`/stock/${row.stock_code}`}
                          className="group inline-flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        >
                          <span className="font-mono font-black text-slate-900 group-hover:text-blue-700">
                            {row.stock_code}
                          </span>
                          <span className="font-medium text-slate-600">
                            {row.stock_name || "—"}
                          </span>
                        </Link>
                      </th>
                      {config.cells(row).map((cell, cellIndex) => (
                        <td
                          key={`${row.stock_code}-${config.columns[cellIndex]}`}
                          className="px-3 py-3 text-right font-medium text-slate-700"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <ListFilter size={18} aria-hidden="true" /> 方法與限制
          </h2>
          <p className="mt-2">{config.methodology}</p>
          <p className="mt-2 text-xs text-slate-500">
            資料維護日是 uGoodly 資料處理時間，不代表交易所或公司的正式公告時間。排名僅供歷史資料研究，不構成投資建議。
          </p>
        </section>
      </div>
    </main>
  );
}
