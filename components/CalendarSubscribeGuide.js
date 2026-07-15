"use client";

import { useId } from "react";
import { CalendarDays, X } from "lucide-react";

export default function CalendarSubscribeGuide({ onClose }) {
  const titleId = useId();

  return (
    <section
      className="mt-3 max-h-[40vh] overflow-y-auto rounded-lg border border-blue-200 bg-blue-50 p-3 text-left"
      role="region"
      aria-labelledby={titleId}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays className="flex-shrink-0 text-blue-600" size={18} aria-hidden="true" />
          <h3 id={titleId} className="text-sm font-bold text-slate-800">
            連結已複製，接著加入行事曆
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-m-2 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="關閉行事曆訂閱教學"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <ol className="mt-2 space-y-1 text-xs leading-5 text-slate-700">
        <li><strong>Google 行事曆：</strong>其他日曆旁的「＋」→「透過網址」→ 貼上連結。</li>
        <li><strong>Apple 行事曆：</strong>新增行事曆 →「加入訂閱行事曆」→ 貼上連結。</li>
      </ol>
      <p className="mt-2 border-t border-blue-200 pt-2 text-[11px] leading-5 text-slate-600">
        使用「訂閱」後，未來資料更新會自動同步；直接開啟或匯入 .ics 通常只會加入當下的一次性內容。
      </p>
    </section>
  );
}
