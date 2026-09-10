import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

export default function RelatedStocks({ stocks = [] }) {
  if (!stocks.length) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="related-stocks-title">
      <h2 id="related-stocks-title" className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
        <Building2 size={18} className="text-slate-500" aria-hidden="true" />
        同產業股利研究
      </h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        依產業分類列出有足夠歷史資料的個股，方便比較配息紀錄與填息狀態。
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {stocks.map((stock) => (
          <li key={stock.stock_code}>
            <Link
              href={`/stock/${stock.stock_code}`}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <span>{stock.stock_name || stock.stock_code} <span className="font-mono text-xs text-slate-500">{stock.stock_code}</span></span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
