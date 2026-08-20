import RankingPage from "../../../components/ranking/RankingPage";
import { getScreenerData } from "../../../lib/screenerData";

export const revalidate = 3600;

export const metadata = {
  title: "台股連續配息年數排名｜歷年股利延續性研究 - uGoodly",
  description: "依 uGoodly 已儲存的除權息事件整理台股連續配息年數、最近年度配息頻率與歷史事件數。",
  alternates: {
    canonical: "https://ugoodly.com/ranking/consecutive-dividend",
  },
  openGraph: {
    title: "台股連續配息年數排名 - uGoodly",
    description: "查看歷史連續配息年數、配息頻率與資料樣本。",
    url: "https://ugoodly.com/ranking/consecutive-dividend",
    type: "website",
  },
};

export default async function ConsecutiveDividendRankingPage() {
  return (
    <RankingPage
      type="consecutive-dividend"
      result={await getScreenerData()}
    />
  );
}
