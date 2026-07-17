import Link from "next/link";

const knowledgeLinks = [
  { href: "/knowledge#ex-date", label: "除息交易日" },
  { href: "/knowledge#pay-date", label: "股利發放日" },
  { href: "/knowledge#yield", label: "殖利率怎麼看" },
];

export default function SeoContent() {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="homepage-guide-title"
    >
      <div className="mx-auto max-w-4xl px-5 py-7 text-slate-600 md:px-8 md:py-9">
        <p className="text-[10px] font-black tracking-[0.18em] text-slate-500">
          使用指南
        </p>
        <h2
          id="homepage-guide-title"
          className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl"
        >
          查日期、算股息，再理解資料怎麼看
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          首頁以股利日曆與存股試算為主。你可以先查入帳日期、加入自選並輸入持股資料；需要理解除權息名詞時，再前往知識頁閱讀完整說明。
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-blue-700">01 · 查日期</p>
            <h3 className="mt-2 font-black text-slate-900">確認股利何時入帳</h3>
            <p className="mt-2 text-sm leading-6">
              使用月份、股票搜尋與自選篩選，查看除權息和現金股利發放日。
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-emerald-700">02 · 算金額</p>
            <h3 className="mt-2 font-black text-slate-900">估算年度股息與月份分布</h3>
            <p className="mt-2 text-sm leading-6">
              加入自選後開啟「我的自選股」，輸入股數與成本，查看組合試算結果。
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-amber-700">03 · 看觀念</p>
            <h3 className="mt-2 font-black text-slate-900">理解日期與殖利率差異</h3>
            <p className="mt-2 text-sm leading-6">
              完整教學集中在知識頁，首頁保留給日常查詢與試算。
            </p>
          </article>
        </div>

        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h3 className="font-black text-slate-900">股利知識快速入口</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              從除息資格、實際入帳日到殖利率計算，依你現在的問題直接閱讀。
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 md:mt-0 md:justify-end">
            {knowledgeLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500">
          <h3 className="font-bold text-slate-700">資料與估算摘要</h3>
          <p className="mt-1">
            除權息與發放資料參考
            <a
              className="mx-1 rounded text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              href="https://www.twse.com.tw"
              target="_blank"
              rel="noopener noreferrer"
            >
              台灣證券交易所
            </a>
            、
            <a
              className="mx-1 rounded text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              href="https://www.tpex.org.tw"
              target="_blank"
              rel="noopener noreferrer"
            >
              櫃買中心
            </a>
            與
            <a
              className="mx-1 rounded text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              href="https://mops.twse.com.tw"
              target="_blank"
              rel="noopener noreferrer"
            >
              公開資訊觀測站
            </a>
            ，系統每日清晨更新，實際時間以頁面顯示為準。預估殖利率以最近收盤價計算，組合結果僅供資料整理與試算，不構成投資建議。
          </p>
        </div>
      </div>
    </section>
  );
}
