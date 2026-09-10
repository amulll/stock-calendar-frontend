import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "資料來源與計算方法 | uGoodly",
  description: "說明 uGoodly 的台股股利資料來源、更新方式、殖利率、填息與股份分割換算原則。",
  alternates: { canonical: "https://ugoodly.com/methodology" },
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600">
          <ArrowLeft size={18} className="mr-2" />返回首頁
        </Link>
        <header className="mt-5 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <Database className="text-blue-600" aria-hidden="true" />
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">資料來源與計算方法</h1>
          <p className="mt-3 leading-7 text-slate-600">uGoodly 是股利與入帳日研究工具，不提供投資建議。資料可能因公告更正、交易所更新或計算覆核而調整。</p>
        </header>
        <div className="mt-5 space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">資料與更新</h2>
            <p className="mt-2 leading-7 text-slate-600">股利、除權息日、發放日與交易資料以交易所公開資訊及既有資料供應來源交叉整理；每日排程會更新可取得資料。每筆頁面會保留事件日期與資料維護時間，公告內容仍應以公司與交易所正式公告為準。</p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">殖利率與股份基準</h2>
            <p className="mt-2 leading-7 text-slate-600">事件參考殖利率以該次現金股利配對該次已記錄的參考價，不以今天股價回推歷史事件。股利計算機與 Portfolio 則使用現行股數基準；發生股票分割、併股或面額變更後，會保留原始事件金額並另行換算現行每股等值。</p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">填息與索引資格</h2>
            <p className="mt-2 leading-7 text-slate-600">填息率只以已評估事件計算，並同時揭露樣本與歷史涵蓋狀態。個股頁只有在具備至少四筆有效事件且跨兩個年度，或具當年度已公告事件時，才會主動提供給搜尋引擎索引；其他頁面仍可直接使用與分享。</p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-slate-100">
            <ShieldCheck className="text-blue-300" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-black">使用前請自行核實</h2>
            <p className="mt-2 leading-7 text-slate-300">除權息與發放安排可能變動。請在交易或資金規劃前，向公開資訊觀測站、交易所與公司公告再次確認。</p>
          </section>
        </div>
      </div>
    </main>
  );
}
