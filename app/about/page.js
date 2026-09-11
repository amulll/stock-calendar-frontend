import Link from "next/link";
import { ArrowLeft, Info, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "關於 uGoodly | 台股股利日曆",
  description: "認識 uGoodly 股利日曆：網站定位、提供的股利研究工具、資料來源與更新方式、編輯原則與聯絡管道。",
  alternates: { canonical: "https://ugoodly.com/about" },
};

const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "關於 uGoodly",
  url: "https://ugoodly.com/about",
  mainEntity: {
    "@type": "Organization",
    name: "uGoodly",
    url: "https://ugoodly.com",
    logo: "https://ugoodly.com/icon.png",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@ugoodly.com",
      contactType: "customer service",
    },
  },
};

const TOOLS = [
  { href: "/", name: "股利發放日曆", description: "依日期查詢除權息與現金股利入帳日。" },
  { href: "/screener", name: "存股選股表", description: "以殖利率、填息紀錄、配息頻率與連續配息年數篩選個股。" },
  { href: "/ranking/high-yield", name: "高殖利率排行", description: "依公開計算規則排序，並揭露計算樣本與待複核狀態。" },
  { href: "/ranking/consecutive-dividend", name: "連續配息排行", description: "依連續配息年數排序的長期配息紀錄。" },
  { href: "/portfolio", name: "我的存股組合", description: "試算持股的年度股利與入帳時程。" },
  { href: "/knowledge", name: "股市小教室", description: "除息日、發放日與殖利率等基本觀念說明。" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ABOUT_JSON_LD) }} />
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600">
          <ArrowLeft size={18} className="mr-2" />返回首頁
        </Link>
        <header className="mt-5 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <Info className="text-blue-600" aria-hidden="true" />
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">關於 uGoodly</h1>
          <p className="mt-3 leading-7 text-slate-600">uGoodly 股利日曆是專注台股股利的研究工具，把分散在交易所與公開資訊觀測站的除權息日、發放日與歷年配息資料，整理成可以查詢、比較與試算的頁面。uGoodly 不提供投資建議。</p>
        </header>
        <div className="mt-5 space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">提供哪些工具</h2>
            <ul className="mt-3 space-y-2">
              {TOOLS.map((tool) => (
                <li key={tool.href} className="leading-7 text-slate-600">
                  <Link href={tool.href} className="font-semibold text-blue-700 hover:underline">{tool.name}</Link>
                  ：{tool.description}
                </li>
              ))}
              <li className="leading-7 text-slate-600">
                <span className="font-semibold text-slate-800">個股股利研究頁</span>：每檔個股整理歷年配息、填息紀錄、股利試算，以及同產業、除權息日期相近與殖利率相近的相關個股。
              </li>
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">資料怎麼來</h2>
            <p className="mt-2 leading-7 text-slate-600">
              資料取自臺灣證券交易所、證券櫃檯買賣中心與公開資訊觀測站的公開資訊，並由每日排程更新。殖利率、填息率與股份分割換算的計算方式，完整說明於{" "}
              <Link href="/methodology" className="font-semibold text-blue-700 hover:underline">資料來源與計算方法</Link>。
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">編輯原則</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-slate-600">
              <li>保留原始事件資料，並揭露計算基準與樣本數，不以單一數字取代完整脈絡。</li>
              <li>參考價或股份基準資料不完整時標示「待更新」或「待複核」，不以推估值補齊。</li>
              <li>排行與篩選結果依公開資料與固定計算規則產生。</li>
              <li>個股頁需累積足夠研究資料，才會提供給搜尋引擎索引。</li>
              <li>網站可能顯示第三方廣告以維持免費使用，相關說明請見<Link href="/privacy" className="font-semibold text-blue-700 hover:underline">隱私權政策</Link>。</li>
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black text-slate-900">聯絡與資料更正</h2>
            <p className="mt-2 leading-7 text-slate-600">
              發現資料錯誤或有功能建議，歡迎來信{" "}
              <a href="mailto:contact@ugoodly.com" className="font-semibold text-blue-700 hover:underline">contact@ugoodly.com</a>
              ，或透過{" "}
              <a href="https://forms.gle/kiUcMifnNQ6M92sKA" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">聯絡表單</a>
              回報。資料更正會以公司與交易所正式公告為準。
            </p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-slate-100">
            <ShieldCheck className="text-blue-300" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-black">使用前請自行核實</h2>
            <p className="mt-2 leading-7 text-slate-300">
              本網站資訊僅供參考，不構成任何投資建議。交易或資金規劃前，請向公開資訊觀測站、交易所與公司公告再次確認，並參閱
              <Link href="/disclaimer" className="font-semibold text-blue-300 hover:underline">免責聲明</Link>。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
