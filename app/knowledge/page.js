import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Banknote, TrendingUp, AlertCircle } from "lucide-react";

export const metadata = {
  title: "股市新手小教室 - 搞懂除權息、殖利率與發放日 | uGoodly",
  description: "除息日是什麼？股利發放日要等多久？殖利率怎麼算？uGoodly 整理了存股族必知的關鍵知識，助您輕鬆看懂股市行事曆。",
};

export default function KnowledgePage() {
  // FAQ 結構化資料 (SEO 神器)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "除息交易日是什麼？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "「除息交易日」(Ex-Dividend Date) 是決定你是否能領到股利的關鍵日期。你必須在除息日的「前一個交易日」買進並持有股票，才能參與分配股利。如果在除息日當天或之後才買進，就領不到這次的股利了。"
        }
      },
      {
        "@type": "Question",
        "name": "現金股利發放日是什麼時候？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "「發放日」(Payment Date) 是現金真正匯入你銀行戶頭的日子。通常會在除息日之後的 3 到 5 週左右發放，每家公司的作業時間不同。uGoodly 日曆上的綠色圓點就是指這個領錢的日子。"
        }
      },
      {
        "@type": "Question",
        "name": "殖利率怎麼算？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "殖利率 (Yield) 用來衡量存股的回報率。計算公式為：(現金股利 ÷ 買進股價) × 100%。例如股價 100 元，配息 5 元，殖利率就是 5%。注意：股價每天波動，殖利率也會跟著變動。"
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* 導航 */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-slate-500 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            回首頁日曆
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                    <BookOpen size={48} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">股市新手小教室</h1>
                    <p className="text-slate-600">
                        存股族必備的基礎知識，搞懂除權息流程，不再錯過領錢日。
                    </p>
                </div>
            </div>
        </div>

        {/* 內容區塊 */}
        <div className="grid gap-6">
            
            {/* 1. 除息交易日 */}
            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100" id="ex-date">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-4">
                    <div className="bg-rose-100 p-2 rounded-lg text-rose-600"><Calendar size={24} /></div>
                    除息交易日 (Ex-Dividend Date)
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                    <p>
                        這是存股族最重要的日子！簡單來說，這是<strong>「確認股東名單的截止日」</strong>隔天。
                    </p>
                    <div className="bg-rose-50 border-l-4 border-rose-400 p-4 my-4 rounded-r-lg">
                        <p className="font-bold text-rose-800">💡 想要領股利，該什麼時候買？</p>
                        <p className="mt-1 text-rose-700">
                            你必須在<strong>除息日的「前一個交易日」收盤前</strong>買進並持有股票，才能領到這次的股利。
                        </p>
                    </div>
                    <p>
                        <strong>例子：</strong><br/>
                        假設台積電的除息日是 <strong>6月13日</strong>。<br/>
                        ✅ 你在 <strong>6月12日</strong> (或之前) 買進 ⮕ 可以領錢。<br/>
                        ❌ 你在 <strong>6月13日</strong> 當天才買進 ⮕ 領不到這次的錢 (雖然股價變便宜了)。
                    </p>
                </div>
            </article>

            {/* 2. 股利發放日 */}
            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100" id="pay-date">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-4">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Banknote size={24} /></div>
                    現金股利發放日 (Payment Date)
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                    <p>
                        這是現金真正<strong>「入帳」</strong>的日子。在這一天，你會看到銀行戶頭多了一筆錢。
                    </p>
                    <ul className="list-disc pl-5 space-y-2 bg-slate-50 p-4 rounded-xl">
                        <li><strong>時間差：</strong>通常在除息日之後的 <strong>3 ~ 5 週</strong>左右。</li>
                        <li><strong>查詢方式：</strong>uGoodly 日曆上的綠色日期，就是依據這個日子標示的。</li>
                        <li><strong>注意事項：</strong>如果發放日遇到假日，銀行會順延到下一個工作日入帳。</li>
                    </ul>
                </div>
            </article>

            {/* 3. 殖利率 */}
            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100" id="yield">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-4">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><TrendingUp size={24} /></div>
                    殖利率 (Yield)
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                    <p>
                        就像銀行的「存款利率」，股票的「殖利率」代表你投入資金能拿回多少利息（股利）。
                    </p>
                    <div className="flex items-center justify-center p-6 bg-amber-50 rounded-xl border border-amber-100 my-4">
                        <div className="text-center">
                            <div className="text-sm text-slate-500 mb-1">計算公式</div>
                            <div className="text-xl md:text-2xl font-bold text-slate-700 font-mono">
                                ( 現金股利 ÷ 股價 ) × 100%
                            </div>
                        </div>
                    </div>
                    <p>
                        <strong>陷阱注意：</strong><br/>
                        高殖利率不一定代表好股票。有時候是因為股價大跌導致殖利率看起來很高，或者是「一次性獲利」配發的股利。存股族更應該看重<strong>「填息」</strong>的能力，也就是股價在除息後能否漲回原本的價格。
                    </p>
                </div>
            </article>

        </div>
      </div>
    </main>
  );
}