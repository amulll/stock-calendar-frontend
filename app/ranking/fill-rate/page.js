import RankingPage from "../../../components/ranking/RankingPage";
import { getScreenerData } from "../../../lib/screenerData";

export const revalidate = 3600;

export const metadata = {
  title: "台股歷史填息率排名｜成功次數、樣本數與平均天數 - uGoodly",
  description: "依至少 5 次已評估除息事件整理台股歷史填息率，公開成功次數、樣本數、涵蓋率與成功事件平均填息天數。",
  alternates: { canonical: "https://ugoodly.com/ranking/fill-rate" },
  openGraph: {
    title: "台股歷史填息率排名 - uGoodly",
    description: "同時查看填息成功率、成功／已評估樣本與平均填息天數。",
    url: "https://ugoodly.com/ranking/fill-rate",
    type: "website",
  },
};

export default async function FillRateRankingPage() {
  return <RankingPage type="fill-rate" rows={await getScreenerData()} />;
}
