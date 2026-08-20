import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScreenerClient from "../../components/screener/ScreenerClient";
import { getScreenerData } from "../../lib/screenerData";

export const revalidate = 3600;

const PAGE_TITLE = "台股存股選股表｜今年已公告殖利率、填息率、連續配息 - uGoodly";
const PAGE_DESC =
  "免費台股選股工具：依今年已公告現金股利殖利率、填息成功率、連續配息年數與歷史配息頻率排序篩選股票及 ETF。已公告殖利率不包含尚未公告的未來配息。";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: {
    canonical: "https://ugoodly.com/screener",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "https://ugoodly.com/screener",
    siteName: "uGoodly 股利日曆",
    locale: "zh_TW",
    type: "website",
  },
};

export default async function ScreenerPage() {
  const screenerResult = await getScreenerData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "uGoodly 台股存股選股表",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "TWD" },
    description: PAGE_DESC,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-4 md:px-8 md:py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 md:mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={20} className="mr-2" />
            回首頁日曆
          </Link>
        </div>

        {screenerResult.ok ? (
          <ScreenerClient initialRows={screenerResult.rows} />
        ) : (
          <section
            className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-10 text-center"
            role="alert"
          >
            <h1 className="text-xl font-black text-slate-900">存股選股表暫時無法載入</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              後端資料目前無法取得，這不是零筆結果。請稍後重新整理頁面。
            </p>
          </section>
        )}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
          <h2 className="mb-2 text-lg font-black tracking-tight text-slate-900">
            怎麼使用這張選股表？
          </h2>
          <p>
            表格彙整全市場股票與 ETF 的<strong>今年已公告殖利率</strong>（當年度已入庫現金股利 ÷ 最新收盤價，不含尚未公告的未來配息）、
            <strong>下次股利發放日</strong>（已公告且尚未到期的現金股利發放日）、
            <strong>填息成功率</strong>（歷史除息後回補缺口的比例）、<strong>連續配息年數</strong>與
            <strong>配息頻率</strong>。點欄位標題可排序，或直接使用上方的選股組合快速篩選。
            點任一列可進入個股頁查看歷年配息與股利計算機。資料每日更新，僅供研究參考，不構成投資建議。
          </p>
        </section>

        <nav
          className="mt-4 grid gap-3 md:grid-cols-2"
          aria-label="研究排名"
        >
          {[
            ["/ranking/consecutive-dividend", "連續配息年數排名"],
            ["/ranking/high-yield", "今年已公告殖利率排名"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {label} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
