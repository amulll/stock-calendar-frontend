import PortfolioWorkspace from "../../components/portfolio/PortfolioWorkspace";

export const metadata = {
  title: "我的存股組合｜uGoodly",
  description: "在此裝置整理自選股、持股成本與已公告或估算的股息現金流。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 md:px-8 md:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
            此裝置專屬
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            我的存股組合
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            整理自選股、持股成本與每月領息分布。資料只保存在目前瀏覽器，換裝置前請先匯出備份。
          </p>
        </div>
        <PortfolioWorkspace />
      </div>
    </main>
  );
}
