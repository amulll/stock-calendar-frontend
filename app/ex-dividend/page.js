import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  MONTHS_BACK,
  MONTHS_FORWARD,
  getCurrentTaipeiMonth,
  getMonthWindow,
  monthSlug,
} from "../../lib/exDividendMonths.mjs";

// 月份範圍以台北時間的「本月」為基準，每小時重新產生以跨月滾動
export const revalidate = 3600;

const PAGE_URL = "https://ugoodly.com/ex-dividend";

export const metadata = {
  title: "台股除權息月曆｜每月除息股票一覽 - uGoodly",
  description: `依除息日月份瀏覽台股除權息股票，涵蓋過去 ${MONTHS_BACK} 個月與未來 ${MONTHS_FORWARD} 個月，查看每檔現金股利、股票股利與發放日。`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "台股除權息月曆 - uGoodly",
    description: "依除息日月份瀏覽台股除權息股票。",
    url: PAGE_URL,
    type: "website",
  },
};

function groupByYear(months) {
  const years = new Map();
  for (const value of months) {
    if (!years.has(value.year)) years.set(value.year, []);
    years.get(value.year).push(value);
  }
  return [...years.entries()].map(([year, items]) => ({
    year,
    items: [...items].sort((a, b) => a.month - b.month),
  }));
}

export default function ExDividendIndexPage() {
  const current = getCurrentTaipeiMonth();
  const years = groupByYear(getMonthWindow());
  const currentSlug = monthSlug(current);

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 md:px-8 md:py-7">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-bold text-slate-600 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
            回股利日曆
          </Link>
        </div>

        <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
          <p className="text-xs font-black tracking-[0.14em] text-blue-700">除權息月曆</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            台股每月除權息股票一覽
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            依除息日（除權日）所在月份整理台股除權息事件，列出每檔的現金股利、股票股利、現金發放日與事件參考殖利率。首頁的股利日曆以現金發放日排列，適合確認何時入帳；本區以除息日排列，適合查詢哪些股票在該月除息。
          </p>
          <Link
            href={`/ex-dividend/${currentSlug}`}
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            查看 {current.year}年{current.month}月除權息 →
          </Link>
        </header>

        {years
          .sort((a, b) => b.year - a.year)
          .map(({ year, items }) => (
            <section key={year} className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-black text-slate-900">{year} 年</h2>
              <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {items.map((value) => {
                  const slug = monthSlug(value);
                  const isCurrent = slug === currentSlug;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/ex-dividend/${slug}`}
                        className={`flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                          isCurrent
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:text-blue-700"
                        }`}
                      >
                        {value.month} 月{isCurrent ? "（本月）" : ""}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
      </div>
    </main>
  );
}
