import Link from "next/link";
import { ArrowLeft, Banknote } from "lucide-react";
import { notFound } from "next/navigation";
import AdUnit from "../../../components/AdUnit";
import { startOfDay, parseISO } from "date-fns";
import { cache } from "react";
import DividendCalculator from "../../../components/DividendCalculator";
import DividendChart from "../../../components/DividendChart";
import StockHistoryTable from "../../../components/stock/StockHistoryTable";
import StockSeoArticle from "../../../components/stock/StockSeoArticle";
import IncomeCompositionBar from "../../../components/stock/IncomeCompositionBar";
import StockWatchlistActions from "../../../components/stock/StockWatchlistActions";
import StockFillSummary from "../../../components/stock/StockFillSummary";
import { DEFAULT_BACKEND_URL } from "../../../lib/backend";
import { getDividendType, exDateLabel } from "../../../lib/dividendEvent";
import { buildStockMetadataTitle } from "../../../lib/stockMetadata.mjs";

// 設定 ISR 快取時間：股利資料一天最多變一次，1 小時重新驗證足夠，
// 大幅降低後端負載並加快 SEO 頁面的 TTFB
export const revalidate = 3600;

const STOCK_META_IMAGE = "https://ugoodly.com/ugoodly_1200x630.png";

function buildStockMetaDescription({ stockName, stockCode, dailyPrice }) {
  return `免費使用股利計算機，查詢 ${stockName} (${stockCode}) 最新現金股利發放日、除權息日期與殖利率。${
    dailyPrice
      ? `目前股價 ${dailyPrice} 元，可即時試算投報率。`
      : "可即時試算投報率與領息規劃。"
  }`;
}

function buildStockFallbackDescription(stockCode) {
  return `查詢 ${stockCode} 的股利發放日、除權息日期、歷年配息與殖利率變化，搭配免費股利計算機快速試算存股回報。`;
}

// 資料抓取函式
const getStockData = cache(async (id) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

  try {
    const res = await fetch(`${API_URL}/api/stock/${id}`, {
      next: { revalidate: 3600 },
      headers: {
          "X-Service-Token": SERVICE_TOKEN
      }
    });

    if (!res.ok) return null;
    return res.json(); // 預期回傳 { info: {...}, history: [...] }
  } catch (error) {
    console.error("Fetch stock error:", error);
    return null;
  }
});

// 1. 動態生成 SEO Metadata
export async function generateMetadata({ params }) {
  const { id } = params;
  const data = await getStockData(id);
  const fallbackDescription = buildStockFallbackDescription(id);

  // 檢查 info 是否存在
  if (!data || !data.info) {
    return {
      title: `${id} 股利資訊查詢 - uGoodly`,
      description: fallbackDescription,
      alternates: {
        canonical: `https://ugoodly.com/stock/${id}`,
      },
      openGraph: {
        title: `${id} 股利資訊查詢`,
        description: fallbackDescription,
        url: `https://ugoodly.com/stock/${id}`,
        siteName: "uGoodly 股利日曆",
        locale: "zh_TW",
        type: "website",
        images: [
          {
            url: STOCK_META_IMAGE,
            width: 1200,
            height: 630,
            alt: "uGoodly 股利日曆",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${id} 股利資訊查詢`,
        description: fallbackDescription,
        images: [STOCK_META_IMAGE],
      },
    };
  }

  const { info, history } = data;
  const metaDescription = buildStockMetaDescription({
    stockName: info.stock_name,
    stockCode: id,
    dailyPrice: info.daily_price,
  });

  return {
    title: buildStockMetadataTitle({
      stockName: info.stock_name,
      stockCode: id,
      history,
    }),
    description: metaDescription,
    keywords: [info.stock_name, id, "股利計算", "存股試算", "殖利率計算機", "股息試算",
      "股利", "發放日", "除息日", "殖利率", "存股","配息日"],
    alternates: {
      canonical: `https://ugoodly.com/stock/${id}`,
    },
    openGraph: {
      title: `${info.stock_name} (${id}) 股利發放日與試算`,
      description: metaDescription,
      url: `https://ugoodly.com/stock/${id}`,
      siteName: 'uGoodly 股利日曆',
      locale: 'zh_TW',
      type: 'website',
      images: [
        {
          url: STOCK_META_IMAGE,
          width: 1200,
          height: 630,
          alt: "uGoodly 股利日曆",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${info.stock_name} (${id}) 股利日曆`,
      description: metaDescription,
      images: [STOCK_META_IMAGE],
    },
  };
}


// 3. 頁面主體
export default async function StockPage({ params }) {
  const { id } = params;
  const data = await getStockData(id);

  // 檢查 info 是否存在
  if (!data || !data.info) {
    return notFound();
  }

  // 解構 info 與 history
  const { info, metrics, history } = data;
  const displayMarket = (info.market_type === "TPEX" || info.market_type === "上櫃") ? "上櫃" : "上市";
  const today = startOfDay(new Date());

  // 找出「最新一期」配息 (用於顯示 Header 的殖利率、股利與試算機)。
  // 領息站定位：headline 以「有配發現金股利」的場次為主；純除權(配股、無現金)不主導
  // headline，只有當該股從未配過現金時才退而顯示。純除權事件仍完整保留在下方歷史發放紀錄表。
  const cashHistory = history.filter(item => Number(item.cash_dividend) > 0);
  const dividendHistory = history.filter(item => Number(item.cash_dividend) > 0 || Number(item.stock_dividend) > 0);
  const sourceList =
    cashHistory.length > 0 ? cashHistory : dividendHistory.length > 0 ? dividendHistory : history;

  const futureEvents = sourceList.filter(item => {
      if (!item.ex_date) return false;
      const exDate = parseISO(item.ex_date);
      return exDate >= today;
  });

  let latestEvent = null;
  if (futureEvents.length > 0) {
      latestEvent = [...futureEvents].sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date))[0];
  } else {
      latestEvent = [...sourceList].sort((a, b) => new Date(b.ex_date) - new Date(a.ex_date))[0];
  }

  // 防呆
  if (!latestEvent) latestEvent = { cash_dividend: 0, ex_date: null, pay_date: null };

  // 最近一筆「有配息組成資料」的場次 (僅 ETF 有；一般個股為 null)
  const latestComposition = [...history]
    .filter((item) => item.income_composition && item.ex_date)
    .sort((a, b) => new Date(b.ex_date) - new Date(a.ex_date))[0] || null;

  // 使用 info.daily_price 計算即時殖利率
  let currentYieldRate = "--";
  if (latestEvent.cash_dividend && info.daily_price > 0) {
      currentYieldRate = ((latestEvent.cash_dividend / info.daily_price) * 100).toFixed(2);
  }

  // 準備結構化資料 (使用 info)
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `${info.stock_name} 股利計算機`,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TWD"
      },
      "featureList": "股票股利試算, 殖利率換算, 投入成本計算",
      "description": `線上免費試算 ${info.stock_name} (${id}) 現金股利與殖利率投報率。`
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
        "@type": "ListItem",
        "position": 1,
        "name": "首頁",
        "item": "https://ugoodly.com"
        },
        {
        "@type": "ListItem",
        "position": 2,
        "name": `${info.stock_name} (${id})`,
        "item": `https://ugoodly.com/stock/${id}`
        }
    ]
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-4 md:px-8 md:py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-6xl">
        <div className="mb-3 md:mb-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-blue-600">
            <ArrowLeft size={20} className="mr-2" />
            回首頁日曆
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Header */}
          <div className="border-b border-slate-200 bg-white p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_520px] md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-sm font-bold text-slate-800">
                    {id}
                  </span>
                  <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-sm text-slate-500">
                    {displayMarket}
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{info.stock_name}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  股利發放、殖利率、歷史配息與試算工具。
                </p>
                <div className="mt-3">
                  <StockWatchlistActions
                    stockCode={id}
                    stockName={info.stock_name}
                  />
                </div>
              </div>

              {/* 股價與殖利率儀表板 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="mb-1 text-[11px] font-semibold text-slate-500">最新收盤價</div>
                  <div className="text-xl font-black tracking-tight text-slate-950">
                    {info.daily_price ? `$${info.daily_price}` : "--"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700">
                  <div className="mb-1 text-[11px] font-semibold text-slate-500">
                    {getDividendType(latestEvent) === "stock" ? "股票股利" : "現金股利"}
                  </div>
                  <div className="text-xl font-black tracking-tight text-slate-950">
                    {getDividendType(latestEvent) === "stock"
                      ? `配股 ${Number(latestEvent.stock_dividend || 0)}`
                      : Number(latestEvent.cash_dividend).toFixed(3)}
                  </div>
                </div>
                <div className={`rounded-lg border px-3 py-2.5
                    ${currentYieldRate !== "--" && Number(currentYieldRate) > 5 ? "border-slate-300 bg-slate-50 text-slate-900" : "border-slate-200 bg-white text-slate-700"}
                `}>
                  <div className="mb-1 text-[11px] font-semibold opacity-80">
                    最新一期單次殖利率
                  </div>
                  <div className="flex items-center gap-2 text-xl font-black tracking-tight">
                    {currentYieldRate !== "--" ? `${currentYieldRate}%` : "--"}
                    {currentYieldRate !== "--" && Number(currentYieldRate) > 5 && <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-600">高</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 p-4 md:p-5">

            {/* 最新股利區塊 (資料來自 latestEvent) */}
            <section className="rounded-lg border border-slate-200 bg-white">
              <h2 className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-base font-black tracking-tight text-slate-900">
                <Banknote className="text-slate-500" /> 最新股利資訊
              </h2>
              <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-500">
                    {getDividendType(latestEvent) === "stock" ? "股票股利" : "現金股利"}
                  </div>
                  <div className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                    {getDividendType(latestEvent) === "stock" ? (
                      <>配股 {Number(latestEvent.stock_dividend || 0)}</>
                    ) : (
                      <>
                        {Number(latestEvent.cash_dividend).toFixed(3)} <span className="text-base font-normal text-slate-500">元</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 text-sm font-semibold text-slate-500">股利時程</div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">{exDateLabel(latestEvent)}</div>
                      <div className="mt-1 whitespace-nowrap text-base font-black text-slate-900">
                        {latestEvent.ex_date || "尚未公布"}
                      </div>
                    </div>
                    <div className="h-px w-8 bg-slate-300 md:w-12" />
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500">發放日期</div>
                      <div className="mt-1 whitespace-nowrap text-base font-black text-slate-900">
                        {latestEvent.pay_date || "尚未公布"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
              {/* 股利試算機 */}
              <section>
                  <DividendCalculator
                      stockName={info.stock_name}
                      cashDividend={latestEvent.cash_dividend}
                      stockPrice={info.daily_price}
                  />
              </section>

              {/* 歷年股利圖表 */}
              <section>
                  <DividendChart history={history} />
              </section>
            </div>

            {/* ETF 配息組成 (突顯收益平準金) */}
            {latestComposition && (
              <IncomeCompositionBar
                composition={latestComposition.income_composition}
                exDate={latestComposition.ex_date}
              />
            )}

            {/* 歷史發放紀錄 */}
            <StockFillSummary metrics={metrics} />

            <StockHistoryTable history={history} />

            {/* SEO 描述文章 */}
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5">
              <StockSeoArticle
                info={info}
                latestDividend={latestEvent}
                historicalRecords={history}
                metrics={metrics}
              />
            </section>

            <div className="mt-8">
              <AdUnit type="rectangle" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
