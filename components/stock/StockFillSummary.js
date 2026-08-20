import { CheckCircle2, Clock3, History, TimerReset } from "lucide-react";

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-black tracking-tight text-slate-950">
        {value}
      </dd>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

export default function StockFillSummary({ metrics }) {
  const total = Number(metrics?.total_ex_events || 0);
  const evaluated = Number(metrics?.evaluated_fill_events || 0);
  const successful = Number(metrics?.successful_fill_events || 0);
  const failed = Number(metrics?.failed_fill_events || 0);
  const unresolved = Number(metrics?.unresolved_fill_events || 0);
  const fillRate = Number(metrics?.fill_rate || 0);
  const averageDays = Number(metrics?.avg_fill_days || 0);
  const coverage = total > 0 ? (evaluated / total) * 100 : 0;

  return (
    <section
      className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      aria-labelledby="stock-fill-summary-title"
    >
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <h2
          id="stock-fill-summary-title"
          className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900"
        >
          <History size={18} className="text-slate-500" aria-hidden="true" />
          歷史填息研究摘要
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          僅描述本站已儲存且已完成觀察的歷史除權息事件，不預測未來是否填息。
        </p>
      </div>

      <dl className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="歷史填息成功率"
          value={evaluated > 0 ? `${fillRate.toFixed(1)}%` : "—"}
          detail={evaluated > 0 ? `${successful} 次成功／${evaluated} 次已評估` : "尚無已評估樣本"}
        />
        <MetricCard
          label="成功事件平均天數"
          value={successful > 0 ? `${averageDays.toFixed(1)} 天` : "—"}
          detail="只計入成功填息事件"
        />
        <MetricCard
          label="評估涵蓋率"
          value={total > 0 ? `${coverage.toFixed(1)}%` : "—"}
          detail={`${evaluated} 次已評估／${total} 次歷史事件`}
        />
        <MetricCard
          label="未完成評估"
          value={`${unresolved} 次`}
          detail={`${failed} 次逾觀察期未填息另已列入評估失敗`}
        />
      </dl>

      <div className="grid gap-2 border-t border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600 md:grid-cols-4">
        <span className="flex items-start gap-2">
          <CheckCircle2 size={15} className="mt-0.5 text-emerald-600" aria-hidden="true" />
          已填息：記錄實際天數
        </span>
        <span className="flex items-start gap-2">
          <TimerReset size={15} className="mt-0.5 text-amber-600" aria-hidden="true" />
          逾觀察期：列入已評估失敗
        </span>
        <span className="flex items-start gap-2">
          <Clock3 size={15} className="mt-0.5 text-blue-600" aria-hidden="true" />
          觀察中：尚不進成功率分母
        </span>
        <span className="flex items-start gap-2">
          <History size={15} className="mt-0.5 text-slate-500" aria-hidden="true" />
          待計算：資料尚未完成處理
        </span>
      </div>
    </section>
  );
}
