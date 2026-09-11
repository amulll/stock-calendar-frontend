import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { buildRelatedStockSections } from "../../lib/relatedStocks.mjs";

export default function RelatedStocks({ groups = null, stocks = [] }) {
  const sections = buildRelatedStockSections(groups, stocks);
  if (!sections.length) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="related-stocks-title">
      <h2 id="related-stocks-title" className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
        <Building2 size={18} className="text-slate-500" aria-hidden="true" />
        相關股利研究
      </h2>
      <div className="mt-3 space-y-4">
        {sections.map((section) => (
          <div key={section.key}>
            <h3 className="text-sm font-black text-slate-800">{section.title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{section.description}</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {section.links.map((link) => (
                <li key={link.stockCode}>
                  <Link
                    href={`/stock/${link.stockCode}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="min-w-0">
                      {link.stockName} <span className="font-mono text-xs text-slate-500">{link.stockCode}</span>
                      {link.context && (
                        <span className="ml-2 whitespace-nowrap text-xs font-medium text-slate-500">{link.context}</span>
                      )}
                    </span>
                    <ArrowUpRight size={15} className="shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
