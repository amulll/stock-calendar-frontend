// 個股頁底部的相關研究連結：把後端 related_groups 整理成可渲染的區塊。
// 後端尚未部署新欄位時，退回舊版 related_stocks（僅同產業、無脈絡標籤）。

const SECTION_DEFINITIONS = [
  {
    key: "same_industry",
    title: "同產業股利研究",
    description: "依產業分類列出有足夠歷史資料的個股，方便比較配息紀錄與填息狀態。",
  },
  {
    key: "nearby_ex_date",
    title: "除權息日期相近",
    description: "下一次（或最近一次）除權息日相差 30 天內的個股，方便比較同一時期的配息安排。",
  },
  {
    key: "similar_yield",
    title: "今年已公告殖利率相近",
    description: "以今年已公告現金股利與各場次參考價計算，差距在 1 個百分點以內。",
  },
];

function formatContext(sectionKey, item) {
  if (sectionKey === "nearby_ex_date" && item.reference_ex_date) {
    return `除權息 ${item.reference_ex_date}`;
  }
  if (sectionKey === "similar_yield" && Number.isFinite(item.current_year_yield)) {
    return `殖利率 ${item.current_year_yield.toFixed(2)}%`;
  }
  return null;
}

function toLinks(sectionKey, items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item?.stock_code)
    .map((item) => ({
      stockCode: item.stock_code,
      stockName: item.stock_name || item.stock_code,
      context: formatContext(sectionKey, item),
    }));
}

export function buildRelatedStockSections(groups, legacyStocks = []) {
  if (groups && typeof groups === "object") {
    return SECTION_DEFINITIONS.flatMap((definition) => {
      const links = toLinks(definition.key, groups[definition.key]);
      if (!links.length) return [];
      const industry =
        definition.key === "same_industry" ? groups.same_industry.find((item) => item?.industry_type)?.industry_type : null;
      return [
        {
          key: definition.key,
          title: industry ? `${definition.title}：${industry}` : definition.title,
          description: definition.description,
          links,
        },
      ];
    });
  }

  const [industryDefinition] = SECTION_DEFINITIONS;
  const legacyLinks = toLinks(industryDefinition.key, legacyStocks);
  return legacyLinks.length ? [{ ...industryDefinition, links: legacyLinks }] : [];
}
