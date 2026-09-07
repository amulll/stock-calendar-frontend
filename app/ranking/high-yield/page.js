import RankingPage from "../../../components/ranking/RankingPage";
import { getScreenerData } from "../../../lib/screenerData";

export const revalidate = 3600;

export const metadata = {
  title: "台股今年已公告殖利率排名｜非預估殖利率 - uGoodly",
  description: "以今年各次已入庫現金股利配對除息前參考價，整理台股今年已公告殖利率並排除待複核高值。",
  alternates: { canonical: "https://ugoodly.com/ranking/high-yield" },
  openGraph: {
    title: "台股今年已公告殖利率排名 - uGoodly",
    description: "查看以事件參考價對齊計算的今年已公告殖利率。",
    url: "https://ugoodly.com/ranking/high-yield",
    type: "website",
  },
};

export default async function HighYieldRankingPage() {
  return <RankingPage type="high-yield" result={await getScreenerData()} />;
}
