import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata = {
  title: "股票分割後殖利率怎麼算？用寶雅 5904 說明股份基準｜uGoodly",
  description:
    "股票分割後，歷史每股股利不能直接除以分割後股價。用寶雅 5904 的 1 拆 10 實例，說明股利、股價與持股數必須使用同一股份基準。",
  alternates: {
    canonical: "https://ugoodly.com/knowledge/stock-split-dividend-yield",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "股票分割後殖利率怎麼算？用寶雅 5904 說明股份基準",
  description:
    "說明股票分割後，歷史每股股利、參考股價與持股數如何換算到一致股份基準。",
  mainEntityOfPage: "https://ugoodly.com/knowledge/stock-split-dividend-yield",
  author: { "@type": "Organization", name: "uGoodly" },
  publisher: { "@type": "Organization", name: "uGoodly" },
};

export default function StockSplitDividendYieldArticle() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="mx-auto max-w-3xl">
        <Link href="/knowledge" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-700">
          <ArrowLeft size={18} className="mr-2" /> 回股利知識庫
        </Link>

        <header className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-9">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
            <Scale size={15} /> 資料正確性筆記
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">
            股票分割後殖利率怎麼算？先把股利與股價放回同一個股份基準
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            股票分割不會憑空增加公司的價值，卻會同時改變每股價格、每股股利與持有股數。只調整其中一個數字，殖利率和預估領息就可能整整差一個數量級。
          </p>
        </header>

        <div className="mt-5 space-y-5 text-[15px] leading-8 text-slate-700">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-950">最常見的錯法：舊股利除以新股價</h2>
            <p className="mt-3">
              假設一家公司在 1 拆 10 前，每股配發 25.5 元，事件當時的參考價是 677 元。這次事件的參考殖利率約為 25.5 ÷ 677＝3.77%。完成分割後，股價與每股股利的比較基準都應除以 10；換成目前股份基準後，每股股利是 2.55 元。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-rose-50 p-4 text-rose-950">
                <div className="text-xs font-black uppercase tracking-wider">基準混用</div>
                <div className="mt-2 font-mono text-lg font-black">25.5 ÷ 71.7 ≈ 35.6%</div>
                <p className="mt-1 text-sm leading-6">分子仍是分割前每股股利，分母卻是分割後股價，結果失真。</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-950">
                <div className="text-xs font-black uppercase tracking-wider">目前股份基準</div>
                <div className="mt-2 font-mono text-lg font-black">2.55 ÷ 71.7 ≈ 3.56%</div>
                <p className="mt-1 text-sm leading-6">股利與股價都在分割後基準，才可直接比較。</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-950">領息金額也要跟著換算</h2>
            <p className="mt-3">
              1 拆 10 後的一張股票仍是 1,000 股，但這 1,000 股是「分割後股份」。用分割前每股 25.5 元直接乘上 1,000 股，會得到錯誤的 25,500 元；換成目前股份基準每股 2.55 元後，試算結果才是 2,550 元。
            </p>
            <p className="mt-3">
              因此，歷史表可以保留原事件公告數字供查證，但凡是拿歷史股利去搭配目前股價、目前股數或投資組合，都必須先套用股份換發倍率。
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-950">uGoodly 怎麼呈現這兩種數字</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>歷史事件保留原始每股股利，避免改寫當年的公告事實。</li>
              <li>計算機與 Portfolio 使用換算至目前股份基準的每股股利。</li>
              <li>事件殖利率仍以該次事件參考價計算，避免拿歷史股利混用最新收盤價。</li>
              <li>發生股份換發時，頁面明示原始金額、換發倍率與換算後金額。</li>
            </ul>
            <p className="mt-4">
              可查看 <Link href="/stock/5904" className="font-bold text-blue-700 hover:underline">寶雅 5904 股利頁</Link> 的實際呈現，或閱讀 <Link href="/methodology" className="font-bold text-blue-700 hover:underline">資料來源與計算方法</Link>。
            </p>
          </section>

          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            本文用於解釋資料換算方法，不構成投資建議。殖利率只是單一事件或期間的比例，仍須搭配配息持續性、價格風險與資料涵蓋範圍判讀。
          </aside>
        </div>
      </article>
    </main>
  );
}
