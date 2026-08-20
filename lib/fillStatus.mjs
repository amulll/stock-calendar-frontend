const PRESENTATIONS = {
  filled: {
    label: "已填息",
    tone: "border-slate-200 bg-slate-100 text-slate-600",
  },
  unfilled_after_window: {
    label: "逾觀察期未填息",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  observing: {
    label: "觀察中",
    tone: "border-blue-200 bg-blue-50 text-blue-700",
  },
  not_calculated: {
    label: "待計算",
    tone: "border-slate-200 bg-slate-50 text-slate-500",
  },
  not_applicable: {
    label: "不適用",
    tone: "border-slate-200 bg-slate-50 text-slate-500",
  },
};

export function getFillPresentation(record, today) {
  const presentation = PRESENTATIONS[record?.fill_status];
  if (!presentation) {
    return {
      label: "狀態未提供",
      tone: "border-slate-200 bg-slate-50 text-slate-500",
    };
  }

  if (record.fill_status === "filled") {
    const days = Number(record.days_to_fill);
    return {
      ...presentation,
      label: days >= 1 ? `已填息 · ${days} 天` : presentation.label,
    };
  }

  if (
    record.fill_status === "not_applicable" &&
    record.ex_date &&
    record.ex_date >= today
  ) {
    return { ...presentation, label: "尚未除權息" };
  }

  return presentation;
}
