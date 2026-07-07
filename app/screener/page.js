import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScreenerClient from "../../components/screener/ScreenerClient";

export const revalidate = 3600;

const PAGE_TITLE = "台股存股選股表｜殖利率、填息率、連續配息排行 - uGoodly";
const PAGE_DESC =
  "免費台股選股工具：依殖利率、填息成功率、連續配息年數、配息頻率排序篩選全市場股票與 ETF。內建安心存股、月月現金流、高息機會三種選股組合，快速找出適合的定存股。";

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

async function getScreenerData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ggo.zeabur.app";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

  try {
    const res = await fetch(`${API_URL}/api/screener`, {
      headers: { "X-Service-Token": SERVICE_TOKEN },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Screener fetch error:", error);
    return [];
  }
}

export default async function ScreenerPage() {
  const rows = await getScreenerData();

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

        <ScreenerClient initialRows={rows} />

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
          <h2 className="mb-2 text-lg font-black tracking-tight text-slate-900">
            怎麼使用這張選股表？
          </h2>
          <p>
            表格彙整全市場股票與 ETF 的<strong>年度預估殖利率</strong>（當年度現金股利 ÷ 最新收盤價）、
            <strong>填息成功率</strong>（歷史除息後回補缺口的比例）、<strong>連續配息年數</strong>與
            <strong>配息頻率</strong>。點欄位標題可排序，或直接使用上方的選股組合快速篩選。
            點任一列可進入個股頁查看歷年配息與股利計算機。資料每日更新，僅供研究參考，不構成投資建議。
          </p>
        </section>
      </div>
    </main>
  );
}
