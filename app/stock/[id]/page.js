import Link from "next/link";
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Banknote } from "lucide-react";
import { notFound } from "next/navigation";

// 設定 ISR 快取時間 (例如 1 小時更新一次)
export const revalidate = 3600;

// 1. 動態生成 SEO Metadata (關鍵!)
export async function generateMetadata({ params }) {
  const { id } = params;
  const data = await getStockData(id);

  if (!data || data.length === 0) {
    return { title: "查無股票資料" };
  }

  const info = data[0]; // 最新一筆資料
  const year = info.ex_date ? info.ex_date.split("-")[0] : new Date().getFullYear();

  return {
    title: `${info.stock_name} (${id}) ${year} 股利發放日、除息日與殖利率查詢 - uGoodly`,
    description: `查詢 ${info.stock_name} (${id}) 最新現金股利發放日、除權息日期與歷史配息紀錄。依據目前股價 ${info.stock_price || '-'} 元計算，預估殖利率為 ${info.yield_rate || '-'}%。`,
    keywords: [info.stock_name, id, "股利", "發放日", "除息日", "殖利率", "存股"],
  };
}

// 2. 資料抓取函式
async function getStockData(id) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    // 這裡使用 fetch 搭配 revalidate，不需 axios
    const res = await fetch(`${API_URL}/api/stock/${id}`, {
      next: { revalidate: 3600 }
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
    return notFound(); // 回傳 404 頁面
  }

  const currentInfo = history[0];
  
  // 過濾歷史紀錄 (只顯示今天之前的)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const historicalRecords = history.filter(item => {
      const dateStr = item.pay_date || item.ex_date;
      if (!dateStr) return false;
      return new Date(dateStr) < today;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
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

            {/* 歷史紀錄區塊 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" /> 歷史發放紀錄
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">發放日</th>
                      <th className="px-4 py-3">除息日</th>
                      <th className="px-4 py-3 text-right">現金股利</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historicalRecords.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-slate-400">無過去紀錄</td>
                      </tr>
                    ) : (
                      historicalRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-medium text-slate-700">{item.pay_date || "未定"}</td>
                          <td className="px-4 py-3 text-slate-500">{item.ex_date}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">
                            {Number(item.cash_dividend).toFixed(4)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 廣告版位 (In-Page) */}
            <div className="w-full h-[250px] bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
              廣告贊助版位 (響應式)
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}