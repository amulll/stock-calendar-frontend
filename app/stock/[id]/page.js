import Link from "next/link";
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Banknote, ExternalLink, Info } from "lucide-react";
import { notFound } from "next/navigation";
import AdUnit from "../../../components/AdUnit"; 
import { startOfDay, parseISO } from "date-fns";
import DividendCalculator from "../../../components/DividendCalculator"; 
import DividendChart from "../../../components/DividendChart"; // 👈 新增這行

// 設定 ISR 快取時間 (例如 1 小時更新一次)
export const revalidate = 3600;

// 1. 動態生成 SEO Metadata (關鍵!)
export async function generateMetadata({ params }) {
  const { id } = params;
  const data = await getStockData(id);

  if (!data || data.length === 0) {
    return { title: "查無股票資料" };
  }

  const info = data[0]; 
  const year = info.ex_date ? info.ex_date.split("-")[0] : new Date().getFullYear();
  const ogImageUrl = `https://ugoodly.com/ugoodly_1200x630.png`;
  return {
    title: `${info.stock_name} (${id}) ${year} 股利發放日、殖利率計算與股利計算 - uGoodly`,
    description: `免費使用股利計算機，查詢 ${info.stock_name} (${id}) 最新現金股利發放日、除權息日期與配息紀錄、線上試算存股投報率。查詢 ${year} 最新除權息日、現金股利發放日，並提供即時股價換算殖利率與歷史配息紀錄。`,
    keywords: [info.stock_name, id, "股利計算", "存股試算", "殖利率計算機", "股息試算", 
      "股利", "發放日", "除息日", "殖利率", "存股"],
    alternates: {
      canonical: `https://ugoodly.com/stock/${id}`,
    },
    openGraph: {
      title: `${info.stock_name} (${id}) 股利發放日與試算`,
      description: `查詢 ${info.stock_name} 最新現金股利與殖利率，使用線上計算機試算存股回報。`,
      url: `https://ugoodly.com/stock/${id}`,
      siteName: 'uGoodly 股利日曆',
      locale: 'zh_TW',
      type: 'website',
      images: [
        {
          url: ogImageUrl, // 指定圖片網址
          width: 192,      // icon.png 的寬度
          height: 192,     // icon.png 的高度
          alt: 'uGoodly Logo',
        },
      ],
    },
    
    // 👇 建議同時加上 Twitter Card 設定 (雖然台灣少用，但對 SEO 完整性有幫助)
    twitter: {
      card: 'summary_large_image',
      title: `${info.stock_name} (${id}) 股利日曆`,
      description: `查詢 ${info.stock_name} 殖利率與除息日`,
      images: [ogImageUrl],
    },
  };
}

// 🔥 2. 自動產生 SEO 描述文字的函式
function generateSeoArticle(info, historicalRecords) {
    const { stock_name, stock_code, yield_rate, cash_dividend, pay_date, ex_date, stock_price } = info;
    
    // 計算平均配息 (如果有歷史資料)
    const avgDividend = historicalRecords.length > 0 
        ? (historicalRecords.reduce((acc, cur) => acc + (cur.cash_dividend || 0), 0) / historicalRecords.length).toFixed(2)
        : 0;

    return (
        <article className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Info size={20} className="text-blue-500"/>
                關於 {stock_name} ({stock_code}) 的配息概況
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
                <strong>{stock_name} ({stock_code})</strong> 是台股受關注的標的之一。
                根據最新資料，該公司最新一期的現金股利為 <strong>{cash_dividend} 元</strong>。
                以目前的參考股價 {stock_price} 元計算，其單次殖利率約為 <span className="text-amber-600 font-bold">{yield_rate}%</span>。
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
                投資人若有意參與本次除權息，須注意<strong>除息交易日為 {ex_date}</strong>，
                並預計於 <strong>{pay_date || "尚未公告"}</strong> 發放現金股利。
                {historicalRecords.length > 1 && (
                    <span>
                        回顧過去紀錄，{stock_name} 的歷史平均配息金額約為 {avgDividend} 元。
                    </span>
                )}
            </p>
            
            <h3 className="text-lg font-bold text-slate-700 mt-6 mb-2">
                如何使用 {stock_name} 股利計算機？
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
                不想手動按計算機嗎？使用上方的<strong>「{stock_name} 股利計算機」</strong>，
                您只需輸入預計持有的張數（例如 10 張 = 10,000 股），系統即會根據最新現金股利 
                <strong>{cash_dividend} 元</strong>，自動計算出您可領取的總股利金額。
                此外，您也可以輸入預計投入的資金（例如 100 萬元），系統會依據目前股價 
                <strong>{stock_price} 元</strong>，反推您可以買進的股數與預估回報。
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-slate-700">
                <p>
                    <strong>💡 投資小撇步：</strong>
                    想要領取 {stock_name} 的股利，必須在除息日 ({ex_date}) 的<strong>前一個交易日</strong>買進並持有。
                    除息日當天買進的股票，將無法獲得該次配息權利。
                </p>
            </div>
        </article>
    );
}

// 資料抓取函式
async function getStockData(id) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN; 

  try {
    const res = await fetch(`${API_URL}/api/stock/${id}`, {
      next: { revalidate: 3600 },
      headers: {
          "X-Service-Token": SERVICE_TOKEN
      }
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch stock error:", error);
    return null;
  }
}

// 3. 頁面主體
export default async function StockPage({ params }) {
  const { id } = params;
  const history = await getStockData(id);

  if (!history || history.length === 0) {
    return notFound(); 
  }

  const today = startOfDay(new Date());
  let currentInfo = null;

  const validHistory = history.filter(item => Number(item.cash_dividend) > 0 || Number(item.stock_dividend) > 0);
  const sourceList = validHistory.length > 0 ? validHistory : history;

  const futureEvents = sourceList.filter(item => {
      if (!item.ex_date) return false;
      const exDate = parseISO(item.ex_date);
      return exDate >= today;
  });

  if (futureEvents.length > 0) {
      const sortedFuture = [...futureEvents].sort((a, b) => new Date(a.ex_date) - new Date(b.ex_date));
      currentInfo = sortedFuture[0];
  } else {
      const sortedHistory = [...sourceList].sort((a, b) => new Date(b.ex_date) - new Date(a.ex_date));
      currentInfo = sortedHistory[0];
  }

  const historicalRecords = history;
  
  // 準備結構化資料
  const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `${currentInfo.stock_name} 股利計算機`,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TWD"
      },
      "featureList": "股票股利試算, 殖利率換算, 投入成本計算",
      "description": `線上免費試算 ${currentInfo.stock_name} (${id}) 現金股利與殖利率投報率。`
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
      "name": `${currentInfo.stock_name} (${id})`,
      "item": `https://ugoodly.com/stock/${id}`
    }
  ]
};
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      {/* 👇 插入 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
    />
      <div className="max-w-3xl mx-auto">
        
        {/* 導航列 */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-slate-500 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            回首頁日曆
          </Link>
        </div>

        {/* 卡片主體 */}
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
                  {currentInfo.market_type}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{currentInfo.stock_name}</h1>
              
              {/* 股價與殖利率儀表板 */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="text-blue-100 text-xs mb-1">參考收盤價</div>
                  <div className="text-2xl font-bold">
                    {currentInfo.stock_price ? `$${currentInfo.stock_price}` : "--"}
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border backdrop-blur-md
                    ${currentInfo.yield_rate > 5 ? "bg-amber-500/20 border-amber-400/50 text-amber-100" : "bg-white/10 border-white/20 text-blue-100"}
                `}>
                  <div className="text-xs mb-1 opacity-80">預估殖利率</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {currentInfo.yield_rate ? `${currentInfo.yield_rate}%` : "--"}
                    {currentInfo.yield_rate > 5 && <span className="text-sm">🔥</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-8">
            
            {/* 最新股利區塊 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Banknote className="text-emerald-600" /> 最新股利資訊
              </h2>
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-emerald-600 mb-1">現金股利</div>
                  <div className="text-3xl font-bold text-emerald-700">
                    {Number(currentInfo.cash_dividend).toFixed(4)} <span className="text-base font-normal text-emerald-600">元</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-emerald-600">發放日期</div>
                    <div className="text-xl font-bold text-emerald-700">
                      {currentInfo.pay_date || "尚未公布"}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    除息交易日：{currentInfo.ex_date}
                  </div>
                </div>
              </div>
            </section>

            {/* 股利試算機 */}
            <section>
                <DividendCalculator 
                    stockName={currentInfo.stock_name}
                    cashDividend={currentInfo.cash_dividend}
                    stockPrice={currentInfo.stock_price}
                />
            </section>
            {/* 🔥 新增：歷年股利圖表 (插入在這裡) */}
            <section>
                <DividendChart history={historicalRecords} />
            </section>

            {/* 歷史紀錄區塊 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" /> 歷史發放紀錄
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                {/* 🌟 修改重點：已移除所有 text-right 類別，使表格預設靠左對齊 */}
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      {/* 👇 修改 3: 加入 whitespace-nowrap 防止換行 */}
                      <th className="px-4 py-3 whitespace-nowrap">發放日</th>
                      <th className="px-4 py-3 whitespace-nowrap">除息日</th>
                      <th className="px-4 py-3 whitespace-nowrap">現金股利</th>
                      <th className="px-4 py-3 whitespace-nowrap">殖利率</th>
                      <th className="px-4 py-3 whitespace-nowrap">除息前股價</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historicalRecords.length === 0 ? (
                      <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">無過去紀錄</td></tr>
                    ) : (
                      historicalRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          
                          {/* 1. 發放日 */}
                          <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                            {item.pay_date ? (
                                <a 
                                    href={`/?date=${item.pay_date}&openModal=true`}
                                    className="text-blue-600 hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2"
                                    title="在日曆上查看當天發放清單"
                                >
                                    {item.pay_date}
                                </a>
                            ) : "未定"}
                          </td>

                          {/* 2. 除息日 */}
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                             {item.ex_date ? (
                                <a 
                                    href={`/?date=${item.pay_date}&openModal=true`}
                                    className="hover:text-blue-600 hover:underline decoration-slate-300 underline-offset-2"
                                >
                                    {item.ex_date}
                                </a>
                             ) : "-"}
                          </td>

                          {/* 3. 現金股利 (移到這裡) */}
                          <td className="px-4 py-3 font-bold text-emerald-600 whitespace-nowrap">
                            {Number(item.cash_dividend).toFixed(4)}
                          </td>
                          
                          {/* 4. 殖利率 (移到這裡) */}
                          <td className="px-4 py-3 font-medium whitespace-nowrap">
                            {item.yield_rate > 0 ? (
                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                    {item.yield_rate}%
                                </span>
                            ) : "-"}
                          </td>

                          {/* 5. 除息前股價 (移到最後) */}
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {item.stock_price > 0 ? `$${item.stock_price}` : "-"}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            
            {/* SEO 描述文章 */}
            <section className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
                {generateSeoArticle(currentInfo, historicalRecords)}
            </section>            

            {/* 招財貓版位 */}
            <div className="mt-8">
              <AdUnit type="rectangle" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}