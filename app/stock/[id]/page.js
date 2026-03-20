import Link from "next/link";
import { ArrowLeft, Calendar, Banknote, Info } from "lucide-react";
import { notFound } from "next/navigation";
import AdUnit from "../../../components/AdUnit"; 
import { startOfDay, parseISO } from "date-fns";
import DividendCalculator from "../../../components/DividendCalculator"; 
import DividendChart from "../../../components/DividendChart";

// 設定 ISR 快取時間 (例如 1 小時更新一次)
export const revalidate = 0;

// 資料抓取函式
async function getStockData(id) {
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
}

// 1. 動態生成 SEO Metadata
export async function generateMetadata({ params }) {
  const { id } = params;
  const data = await getStockData(id);

  // 檢查 info 是否存在
  if (!data || !data.info) {
    return { title: "查無股票資料" };
  }

  const { info } = data; // 使用 info
  const year = new Date().getFullYear();
  const ogImageUrl = `https://ugoodly.com/ugoodly_1200x630.png`;

  return {
    title: `${info.stock_name} (${id}) ${year} 股利配息日、殖利率與股利計算 - uGoodly`,
    description: `免費使用股利計算機，查詢 ${info.stock_name} (${id}) 最新現金股利發放日、除權息日期。目前股價 ${info.daily_price || '-'} 元，即時殖利率試算。`,
    keywords: [info.stock_name, id, "股利計算", "存股試算", "殖利率計算機", "股息試算", 
      "股利", "發放日", "除息日", "殖利率", "存股","配息日"],
    alternates: {
      canonical: `https://ugoodly.com/stock/${id}`,
    },
    openGraph: {
      title: `${info.stock_name} (${id}) 股利發放日與試算`,
      description: `查詢 ${info.stock_name} 最新現金股利與殖利率，使用免費股利計算機試算存股回報。`,
      url: `https://ugoodly.com/stock/${id}`,
      siteName: 'uGoodly 股利日曆',
      locale: 'zh_TW',
      type: 'website',
      images: [
        {
          url: ogImageUrl, 
          width: 1200,      
          height: 630,     
          alt: 'uGoodly Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${info.stock_name} (${id}) 股利日曆`,
      description: `查詢 ${info.stock_name} 殖利率與除息日`,
      images: [ogImageUrl],
    },
  };
}

// 🔥 2. 自動產生 SEO 描述文字的函式
function generateSeoArticle(info, latestDividend, historicalRecords) {
    // info: 最新基本面, latestDividend: 最新一筆配息資料
    const { stock_name, stock_code, daily_price } = info;
    const { cash_dividend, pay_date, ex_date } = latestDividend || {};
    
    // 即時計算殖利率
    let realtimeYield = 0;
    if (cash_dividend && daily_price > 0) {
        realtimeYield = ((cash_dividend / daily_price) * 100).toFixed(2);
    }
    
    // 計算平均配息 (🔥 修改：小數點後 3 位)
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
                <Info size={20} className="text-blue-500"/>
                關於 {stock_name} ({stock_code}) 配息概況
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
                <strong>{stock_name} ({stock_code})</strong> 
                根據最新資料，該公司最新一期的現金股利為 <strong>{Number(cash_dividend).toFixed(3)} 元</strong>。 {/* 🔥 修改：小數點後 3 位 */}
                以目前的最新收盤價 <strong>{daily_price || "--"} 元</strong> 計算，
                其預估單次殖利率約為 <span className="text-amber-600 font-bold">{realtimeYield}%</span>。
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
                <strong>{Number(cash_dividend).toFixed(3)} 元</strong>，自動計算出您可領取的總股利金額。 {/* 🔥 修改：小數點後 3 位 */}
                此外，您也可以輸入預計投入的資金，系統會依據目前股價 
                <strong>{daily_price || "--"} 元</strong>，反推您可以買進的股數與預估回報。
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-slate-700">
                <p>
                    <strong>💡 投資小撇步：</strong>
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

  // 🔥 修改：檢查 info 是否存在
  if (!data || !data.info) {
    return notFound(); 
  }

  // 🔥 修改：解構 info 與 history
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

  // 🔥 修改：使用 info.daily_price 計算即時殖利率
  let currentYieldRate = "--";
  if (latestEvent.cash_dividend && info.daily_price > 0) {
      currentYieldRate = ((latestEvent.cash_dividend / info.daily_price) * 100).toFixed(2);
  }

  // 🔥 修改：統一格式化函式，強制顯示 3 位小數
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
    <main className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition font-medium">
            <ArrowLeft size={20} className="mr-2" />
            回首頁日曆
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono backdrop-blur-sm">
                  {id}
                </span>
                <span className="text-blue-100 text-sm border border-blue-400/30 px-2 py-0.5 rounded">
                  {displayMarket}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{info.stock_name}</h1>
              
              {/* 股價與殖利率儀表板 */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="text-blue-100 text-xs mb-1">最新收盤價</div>
                  <div className="text-2xl font-bold">
                    {/* 🔥 這裡改用 info.daily_price */}
                    {info.daily_price ? `$${info.daily_price}` : "--"}
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border backdrop-blur-md
                    ${currentYieldRate !== "--" && Number(currentYieldRate) > 5 ? "bg-amber-500/20 border-amber-400/50 text-amber-100" : "bg-white/10 border-white/20 text-blue-100"}
                `}>
                  <div className="text-xs mb-1 opacity-80">預估殖利率(最新)</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {currentYieldRate !== "--" ? `${currentYieldRate}%` : "--"}
                    {currentYieldRate !== "--" && Number(currentYieldRate) > 5 && <span className="text-sm">🔥</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-8">
            
            {/* 最新股利區塊 (資料來自 latestEvent) */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Banknote className="text-emerald-600" /> 最新股利資訊
              </h2>
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-emerald-600 mb-1">現金股利</div>
                  <div className="text-3xl font-bold text-emerald-700">
                    {/* 🔥 修改：小數點後 3 位 */}
                    {Number(latestEvent.cash_dividend).toFixed(3)} <span className="text-base font-normal text-emerald-600">元</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-emerald-600">發放日期</div>
                    <div className="text-xl font-bold text-emerald-700">
                      {latestEvent.pay_date || "尚未公布"}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    除息交易日：{latestEvent.ex_date || "尚未公布"}
                  </div>
                </div>
              </div>
            </section>

            {/* 股利試算機 */}
            <section>
                <DividendCalculator 
                    stockName={info.stock_name}
                    cashDividend={latestEvent.cash_dividend}
                    stockPrice={info.daily_price} // 🔥 傳入最新股價
                />
            </section>
            
            {/* 歷年股利圖表 */}
            <section>
                <DividendChart history={history} />
            </section>

            {/* 歷史紀錄區塊 (資料來自 history) */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" /> 歷史發放紀錄
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-2 py-2 whitespace-nowrap">年度</th>
                      <th className="px-2 py-2 whitespace-nowrap text-emerald-600">股利</th>
                      <th className="px-2 py-2 whitespace-nowrap">發放日</th>
                      <th className="px-2 py-2 whitespace-nowrap">除息日</th>
                      <th className="px-2 py-2 whitespace-nowrap">股利(年)</th>
                      <th className="px-2 py-2 whitespace-nowrap">殖利率(年)</th>
                      <th className="px-2 py-2 whitespace-nowrap">填息天數</th>
                      <th className="px-2 py-2 whitespace-nowrap">除息前股價</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
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
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          {isFirstOfGroup && (
                              <td rowSpan={rowSpanCount} className="px-2 py-2 text-slate-500 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200 bg-white">
                                {currentYear}
                              </td>
                          )}
                          <td className="px-2 py-2 font-bold text-emerald-600/80 whitespace-nowrap">
                            {/* 🔥 使用新的 formatDividend (3位小數) */}
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
                            <td rowSpan={rowSpanCount} className="px-2 py-2 font-bold text-emerald-600 whitespace-nowrap text-center align-middle bg-white/50 border-l border-slate-100">
                              {/* 🔥 使用新的 formatDividend (3位小數) */}
                              {formatDividend(totalCash)}
                              {rowSpanCount > 1 && <span className="text-[10px] text-slate-400 block font-normal">(合計)</span>}
                            </td>
                          )}
                          {isFirstOfGroup && (
                            <td rowSpan={rowSpanCount} className="px-2 py-2 font-medium whitespace-nowrap text-center align-middle bg-white/50">
                              {totalYield > 0 ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                        {formatDividend(totalYield)}%
                                    </span>
                                    {rowSpanCount > 1 && <span className="text-[10px] text-slate-400 mt-0.5">(合計)</span>}
                                  </div>
                              ) : "-"}
                            </td>
                          )}
                          <td className="px-2 py-2 text-slate-400 whitespace-nowrap text-center">
                            {item.days_to_fill && item.days_to_fill > 0 ? (
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
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
            <section className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
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
