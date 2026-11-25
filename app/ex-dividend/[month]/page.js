import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, ListFilter } from "lucide-react";

import { getExMonthDividends } from "../../../lib/exDividendData";
import {
  EVENT_TYPE_LABELS,
  YIELD_REVIEW_THRESHOLD,
  describeDate,
  getAdjacentMonths,
  getEventType,
  groupByExDate,
  isMonthInWindow,
  monthSlug,
  parseMonthSlug,
  summarizeMonth,
} from "../../../lib/exDividendMonths.mjs";
import { getEventYield } from "../../../lib/yieldMetrics.mjs";

export const revalidate = 3600;

const BASE_URL = "https://ugoodly.com";
const amountFormatter = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 4 });

function resolveMonth(slug) {
  const value = parseMonthSlug(slug);
  if (!value || !isMonthInWindow(value)) return null;
  return value;
}

// 後端暫時失敗時直接拋錯，不把空清單當成「本月無資料」快取或送給搜尋引擎
const loadMonth = cache(async (year, month) => {
  const result = await getExMonthDividends({ year, month });
  if (!result.ok) {
    throw new Error(`Ex-month dividends unavailable for ${year}-${month}: ${result.error}`);
  }
  return result.rows;
});

function monthTitle({ year, month }) {
  return `${year}年${month}月`;
}

function shortDate(isoDate) {
  if (!isoDate) return null;
  const { month, day } = describeDate(isoDate);
  return `${month}/${day}`;
}

// 發放日跨年時（例如 12 月除息、隔年 1 月發放）補上年份，避免誤讀
function payDateLabel(isoDate, pageYear) {
  if (!isoDate) return "未公告";
  const { year, month, day } = describeDate(isoDate);
  return year === pageYear ? `${month}/${day}` : `${year}/${month}/${day}`;
}

function longDate(isoDate) {
  const { month, day, weekday } = describeDate(isoDate);
  return `${month}月${day}日（週${weekday}）`;
}

function amountLabel(value) {
  const amount = Number(value || 0);
  return amount > 0 ? `${amountFormatter.format(amount)} 元` : "—";
}

function yieldLabel(row) {
  const value = getEventYield(row);
  if (value == null) return "—";
  if (value > YIELD_REVIEW_THRESHOLD) return "待複核";
  return `${value.toFixed(2)}%`;
}

function maintenanceLabel(timestamp) {
  if (!timestamp) return "尚未提供";
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "尚未提供";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

export async function generateMetadata({ params }) {
  const value = resolveMonth(params.month);
  if (!value) {
    return { title: "找不到此月份 - uGoodly", robots: { index: false, follow: true } };
  }

  const rows = await loadMonth(value.year, value.month);
  const label = monthTitle(value);
  const url = `${BASE_URL}/ex-dividend/${monthSlug(value)}`;
  const title = `${label}除權息股票一覽｜除息日、現金股利與殖利率 - uGoodly`;
  const description =
    rows.length > 0
      ? `${label}共 ${rows.length} 檔台股除權息，依除息日整理現金股利、股票股利、發放日與事件參考殖利率。`
      : `${label}目前尚無已公告的台股除權息資料，公司公告後將陸續更新。`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // 尚無資料的月份（多為未來月份）不送索引，避免空頁被視為低品質內容
    robots: rows.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function ExDividendMonthPage({ params }) {
  const value = resolveMonth(params.month);
  if (!value) notFound();

  const rows = await loadMonth(value.year, value.month);
  const label = monthTitle(value);
  const summary = summarizeMonth(rows);
  const groups = groupByExDate(rows);
  const { prev, next } = getAdjacentMonths(value);

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 md:px-8 md:py-7">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/ex-dividend"
            className="inline-flex min-h-11 items-center text-sm font-bold text-slate-600 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
            所有月份
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <CalendarDays size={16} aria-hidden="true" />
            股利日曆（依發放日）
          </Link>
        </div>

        <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
          <p className="text-xs font-black tracking-[0.14em] text-blue-700">除權息月曆</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            {label}除權息股票一覽
          </h1>
          {summary.total > 0 ? (
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              {label}共有 <strong className="text-slate-900">{summary.total}</strong> 檔台股除權息，
              其中除息 {summary.typeCounts.cash} 檔、除權 {summary.typeCounts.stock} 檔、除權息{" "}
              {summary.typeCounts.both} 檔，分布在 {summary.tradingDays} 個交易日；
              {summary.busiest && (
                <>
                  最集中的是 {longDate(summary.busiest.date)}，共 {summary.busiest.count} 檔。
                </>
              )}
              下表依除息日（除權日）整理每檔的現金股利、股票股利、發放日與事件參考殖利率。
            </p>
          ) : (
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              {label}目前尚無已公告的除權息資料。公司董事會或股東會決議並公告除權息日後，本頁會在資料更新時陸續列入。
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>歸類方式：除息日（除權日）所在月份</span>
            <span>本站資料維護日：{maintenanceLabel(summary.lastUpdated)}</span>
          </div>
        </header>

        {summary.topYields.length > 0 && (
          <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-black text-slate-900">本月事件參考殖利率較高</h2>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              單次現金股利 ÷ 該次除息前參考價；超過 {YIELD_REVIEW_THRESHOLD}% 的待複核數值不列入。
            </p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {summary.topYields.map(({ row, yield: eventYield }, index) => (
                <li key={`${row.stock_code}-${row.ex_date}-${index}`}>
                  <Link
                    href={`/stock/${row.stock_code}`}
                    className="block rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <span className="font-mono text-sm font-black text-slate-900">{row.stock_code}</span>{" "}
                    <span className="text-sm font-medium text-slate-600">{row.stock_name}</span>
                    <span className="mt-1 block text-lg font-black text-emerald-700">{eventYield.toFixed(2)}%</span>
                    <span className="block text-xs text-slate-500">
                      {shortDate(row.ex_date)} 除息 · 現金 {amountLabel(row.cash_dividend)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {groups.map((group) => (
          <section
            key={group.date}
            className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white"
            aria-labelledby={`date-${group.date}`}
          >
            <h2
              id={`date-${group.date}`}
              className="flex items-baseline justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-base font-black text-slate-900"
            >
              <span>{longDate(group.date)}</span>
              <span className="text-xs font-bold text-slate-500">{group.items.length} 檔</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-2" scope="col">股票</th>
                    <th className="px-3 py-2" scope="col">類型</th>
                    <th className="px-3 py-2 text-right" scope="col">現金股利</th>
                    <th className="px-3 py-2 text-right" scope="col">股票股利</th>
                    <th className="px-3 py-2 text-right" scope="col">事件參考殖利率</th>
                    <th className="px-4 py-2 text-right" scope="col">現金發放日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.items.map((row, index) => (
                    <tr key={`${row.stock_code}-${row.ex_date}-${index}`} className="hover:bg-slate-50">
                      <th className="px-4 py-2.5" scope="row">
                        <Link
                          href={`/stock/${row.stock_code}`}
                          className="group inline-flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        >
                          <span className="font-mono font-black text-slate-900 group-hover:text-blue-700">
                            {row.stock_code}
                          </span>
                          <span className="font-medium text-slate-600 group-hover:text-blue-700">
                            {row.stock_name || "—"}
                          </span>
                        </Link>
                      </th>
                      <td className="px-3 py-2.5 text-slate-600">{EVENT_TYPE_LABELS[getEventType(row)]}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-700">{amountLabel(row.cash_dividend)}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-700">{amountLabel(row.stock_dividend)}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-700">{yieldLabel(row)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">
                        {Number(row.cash_dividend || 0) > 0 ? payDateLabel(row.pay_date, value.year) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <nav
          className="mt-4 flex flex-wrap items-center justify-between gap-2"
          aria-label="切換月份"
        >
          {prev ? (
            <Link
              href={`/ex-dividend/${monthSlug(prev)}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <ArrowLeft size={16} className="mr-2" aria-hidden="true" />
              {monthTitle(prev)}除權息
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/ex-dividend/${monthSlug(next)}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {monthTitle(next)}除權息
              <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Link>
          )}
        </nav>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <ListFilter size={18} aria-hidden="true" /> 資料說明
          </h2>
          <p className="mt-2">
            本頁以除息日（純配股為除權日）所在月份歸類，與首頁以現金發放日排列的股利日曆不同。想參與除權息，需在除息日前一個交易日（含）以前買進並持有；現金股利實際入帳則依「現金發放日」。
          </p>
          <p className="mt-2">
            事件參考殖利率 = 該次現金股利 ÷ 該次除息前參考價，只反映單次配息，不是全年殖利率；超過 {YIELD_REVIEW_THRESHOLD}% 的數值標示「待複核」。發放日尚未公告的事件顯示「未公告」。
          </p>
          <p className="mt-2 text-xs text-slate-500">
            資料參考台灣證券交易所、櫃買中心與公開資訊觀測站；資料維護日是 uGoodly 資料處理時間，不代表官方公告時間。本頁僅供資料查詢，不構成投資建議。
            <Link href="/methodology" className="ml-1 font-bold text-blue-700 hover:underline">
              資料來源與計算方法
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
