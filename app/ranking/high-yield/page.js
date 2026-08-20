import RankingPage from "../../../components/ranking/RankingPage";
import { getScreenerData } from "../../../lib/screenerData";

export const revalidate = 3600;

export const metadata = {
  title: "台股今年已公告殖利率排名｜非預估殖利率 - uGoodly",
  description: "以今年已入庫現金股利合計除以最近收盤價，整理台股今年已公告殖利率並說明公告季節造成的不完整性。",
  alternates: { canonical: "https://ugoodly.com/ranking/high-yield" },
  openGraph: {
    title: "台股今年已公告殖利率排名 - uGoodly",
    description: "查看今年已公告現金股利、最近價格與非預估殖利率。",
    url: "https://ugoodly.com/ranking/high-yield",
    type: "website",
  },
};

export default async function HighYieldRankingPage() {
  return <RankingPage type="high-yield" result={await getScreenerData()} />;
}
