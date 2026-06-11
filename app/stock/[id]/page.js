import Link from "next/link";
import { ArrowLeft, Calendar, Banknote, Info } from "lucide-react";
import { notFound } from "next/navigation";
import AdUnit from "../../../components/AdUnit";
import { startOfDay, parseISO } from "date-fns";
import { cache } from "react";
import DividendCalculator from "../../../components/DividendCalculator";
import DividendChart from "../../../components/DividendChart";

// 設定 ISR 快取時間 (例如 1 小時更新一次)
export const revalidate = 0;

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

  try {
    const res = await fetch(`${API_URL}/api/stock/${id}`, {
      cache: 'no-store',
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

  const { info } = data; // 使用 info
  const year = new Date().getFullYear();
  const metaDescription = buildStockMetaDescription({
    stockName: info.stock_name,
    stockCode: id,
    dailyPrice: info.daily_price,
  });

  return {
    title: `${info.stock_name} (${id}) ${year} 股利配息日、殖利率與股利計算 - uGoodly`,
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

// 自動產生 SEO 描述文字的函式
function generateSeoArticle(info, latestDividend, historicalRecords) {
    // info: 最新基本面, latestDividend: 最新一筆配息資料
    const { stock_name, stock_code, daily_price } = info;
    const { cash_dividend, pay_date, ex_date } = latestDividend || {};

    // 即時計算殖利率
    let realtimeYield = 0;
    if (cash_dividend && daily_price > 0) {
        realtimeYield = ((cash_dividend / daily_price) * 100).toFixed(2);
    }

    // 計算平均配息
    const avgDividend = historicalRecords.length > 0
        ? (historicalRecords.reduce((acc, cur) => acc + (cur.cash_dividend || 0), 0) / historicalRecords.length).toFixed(3)
        : 0;

    // 計算平均填息天數
    const validFillRecords = historicalRecords.filter(r =>
        r.days_to_fill !== null &&
        r.days_to_fill !== undefined &&
        r.days_to_fill >= 0
    );
    const avgFillDays = validFillRecords.length > 0
        ? (validFillRecords.reduce((acc, cur) => acc + cur.days_to_fill, 0) / validFillRecords.length).toFixed(1)
        : null;

    return (
        <article className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Info size={20} className="text-slate-500"/>
                關於 {stock_name} ({stock_code}) 配息概況
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
                <strong>{stock_name} ({stock_code})</strong>
                根據最新資料，該公司最新一期的現金股利為 <strong>{Number(cash_dividend).toFixed(3)} 元</strong>。
                以目前的最新收盤價 <strong>{daily_price || "--"} 元</strong> 計算，
                其預估單次殖利率約為 <span className="font-bold text-slate-800">{realtimeYield}%</span>。
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
                投資人若有意參與本次除權息，須注意<strong>除息交易日為 {ex_date || "尚未公告"}</strong>，
                配息日: <strong>{pay_date || "尚未公告"}</strong>。
                {historicalRecords.length > 1 && (
                    <span>
                        回顧過去紀錄，{stock_name} 的歷史平均配息金額約為 {avgDividend} 元
                        {avgFillDays ? (
                            <>
                                ，平均填息天數約為 <strong className="text-slate-700">{avgFillDays} 天</strong>。
                            </>
                        ) : (
                            <>。</>
                        )}
                    </span>
                )}
            </p>

            <h3 className="text-lg font-bold text-slate-700 mt-6 mb-2">
                如何使用 {stock_name} 股利計算機？
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
                不想手動按計算機嗎？使用上方的<strong>「{stock_name} 股利計算機」</strong>，
                您只需輸入預計持有的張數（例如 10 張 = 10,000 股），系統即會根據最新現金股利
                <strong>{Number(cash_dividend).toFixed(3)} 元</strong>，自動計算出您可領取的總股利金額。
                此外，您也可以輸入預計投入的資金，系統會依據目前股價
                <strong>{daily_price || "--"} 元</strong>，反推您可以買進的股數與預估回報。
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                    <strong>投資小撇步：</strong>
                    想要領取 {stock_name} 的股利，必須在除息日 ({ex_date || "--"}) 的<strong>前一個交易日</strong>持有。
                </p>
            </div>
        </article>
    );
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
  const { info, history } = data;
  const displayMarket = (info.market_type === "TPEX" || info.market_type === "上櫃") ? "上櫃" : "上市";
  const today = startOfDay(new Date());

  // 找出「最新一期」配息 (用於顯示 Header 的殖利率與股利)
  const validHistory = history.filter(item => Number(item.cash_dividend) > 0 || Number(item.stock_dividend) > 0);
  const sourceList = validHistory.length > 0 ? validHistory : history;

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

  // 使用 info.daily_price 計算即時殖利率
  let currentYieldRate = "--";
  if (latestEvent.cash_dividend && info.daily_price > 0) {
      currentYieldRate = ((latestEvent.cash_dividend / info.daily_price) * 100).toFixed(2);
  }

  // 統一格式化函式，強制顯示 3 位小數
  const formatDividend = (val) => {
      return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  };

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
                  <div className="mb-1 text-[11px] font-semibold text-slate-500">現金股利</div>
                  <div className="text-xl font-black tracking-tight text-slate-950">
                    {Number(latestEvent.cash_dividend).toFixed(3)}
                  </div>
                </div>
                <div className={`rounded-lg border px-3 py-2.5
                    ${currentYieldRate !== "--" && Number(currentYieldRate) > 5 ? "border-slate-300 bg-slate-50 text-slate-900" : "border-slate-200 bg-white text-slate-700"}
                `}>
                  <div className="mb-1 text-[11px] font-semibold opacity-80">預估殖利率</div>
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
                  <div className="mb-1 text-sm font-semibold text-slate-500">現金股利</div>
                  <div className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                    {Number(latestEvent.cash_dividend).toFixed(3)} <span className="text-base font-normal text-slate-500">元</span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 text-sm font-semibold text-slate-500">股利時程</div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">除息交易日</div>
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

            {/* 歷史紀錄區塊 (資料來自 history) */}
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <h2 className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-base font-black tracking-tight text-slate-900">
                <Calendar className="text-slate-500" /> 歷史發放紀錄
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs md:text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-2 py-2 whitespace-nowrap">年度</th>
                      <th className="px-2 py-2 whitespace-nowrap">股利</th>
                      <th className="px-2 py-2 whitespace-nowrap">發放日</th>
                      <th className="px-2 py-2 whitespace-nowrap">除息日</th>
                      <th className="px-2 py-2 whitespace-nowrap">股利(年)</th>
                      <th className="px-2 py-2 whitespace-nowrap">殖利率(年)</th>
                      <th className="px-2 py-2 whitespace-nowrap">填息天數</th>
                      <th className="px-2 py-2 whitespace-nowrap">除息前股價</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {history.length === 0 ? (
                      <tr><td colSpan="8" className="px-2 py-8 text-center text-slate-400">無過去紀錄</td></tr>
                    ) : (
                      history.map((item, index) => {
                        const getYear = (record) => {
                            if (record.pay_date) return record.pay_date.split("-")[0];
                            if (record.ex_date) return record.ex_date.split("-")[0];
                            return "-";
                        };
                        const currentYear = getYear(item);
                        const prevYear = index > 0 ? getYear(history[index - 1]) : null;
                        const isFirstOfGroup = currentYear !== prevYear;

                        let rowSpanCount = 1;
                        let totalCash = 0;
                        let totalYield = 0;

                        if (isFirstOfGroup) {
                            totalCash += Number(item.cash_dividend || 0);
                            totalYield += Number(item.yield_rate || 0);
                            for (let i = index + 1; i < history.length; i++) {
                                if (getYear(history[i]) === currentYear) {
                                    rowSpanCount++;
                                    totalCash += Number(history[i].cash_dividend || 0);
                                    totalYield += Number(history[i].yield_rate || 0);
                                } else {
                                    break;
                                }
                            }
                        }

                        const formatSmartDate = (dateStr) => {
                            if (!dateStr) return null;
                            const [y, m, d] = dateStr.split("-");
                            if (y === currentYear) return `${m}/${d}`;
                            return `${y}/${m}/${d}`;
                        };

                        return (
                        <tr key={item.id} className="transition hover:bg-slate-50">
                          {isFirstOfGroup && (
                              <td rowSpan={rowSpanCount} className="px-2 py-2 text-slate-600 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200 bg-slate-50">
                                {currentYear}
                              </td>
                          )}
                          <td className="px-2 py-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {formatDividend(item.cash_dividend)}
                          </td>
                          <td className="px-2 py-2 font-medium text-slate-700 whitespace-nowrap">
                            {item.pay_date ? (
                                <a href={`/?date=${item.pay_date}&openModal=true`} className="text-blue-600 hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2">
                                    {formatSmartDate(item.pay_date)}
                                </a>
                            ) : "未定"}
                          </td>
                          <td className="px-2 py-2 text-slate-500 whitespace-nowrap">
                            {item.ex_date ? (
                                <a href={`/?date=${item.ex_date}`} className="hover:text-blue-600 hover:underline decoration-slate-300 underline-offset-2">
                                    {formatSmartDate(item.ex_date)}
                                </a>
                            ) : "-"}
                          </td>
                          {isFirstOfGroup && (
                            <td rowSpan={rowSpanCount} className="px-2 py-2 font-mono font-bold text-slate-900 whitespace-nowrap text-center align-middle bg-slate-50 border-l border-slate-200">
                              {formatDividend(totalCash)}
                              {rowSpanCount > 1 && <span className="text-[10px] text-slate-400 block font-normal">(合計)</span>}
                            </td>
                          )}
                          {isFirstOfGroup && (
                            <td rowSpan={rowSpanCount} className="px-2 py-2 font-medium whitespace-nowrap text-center align-middle bg-white/50">
                              {totalYield > 0 ? (
                                  <div className="flex flex-col items-center">
                                    <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
                                        {formatDividend(totalYield)}%
                                    </span>
                                    {rowSpanCount > 1 && <span className="text-[10px] text-slate-400 mt-0.5">(合計)</span>}
                                  </div>
                              ) : "-"}
                            </td>
                          )}
                          <td className="px-2 py-2 text-slate-400 whitespace-nowrap text-center">
                            {item.days_to_fill && item.days_to_fill > 0 ? (
                                <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                    {item.days_to_fill} 天
                                </span>
                            ) : "-"}
                          </td>
                          <td className="px-2 py-2 text-slate-600 whitespace-nowrap">
                            {item.stock_price > 0 ? `$${item.stock_price}` : "-"}
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SEO 描述文章 (傳入 info) */}
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5">
                {generateSeoArticle(info, latestEvent, history)}
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
