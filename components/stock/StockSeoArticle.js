import { Info } from "lucide-react";
import { getDividendType, exDateLabel } from "../../lib/dividendEvent";

// 個股頁底部的 SEO 說明文章：依最新一筆配息與歷史紀錄自動生成敘述
export default function StockSeoArticle({ info, latestDividend, historicalRecords, metrics }) {
  const { stock_name, stock_code, daily_price } = info;
  const { cash_dividend, stock_dividend, pay_date, ex_date } = latestDividend || {};
  // 最新一期可能是純除權(配股、無現金)，措辭需區分，不可一律稱「現金股利/除息」
  const isStockOnly = getDividendType(latestDividend || {}) === "stock";
  const exLabel = exDateLabel(latestDividend || {});

  let realtimeYield = 0;
  if (cash_dividend && daily_price > 0) {
    realtimeYield = ((cash_dividend / daily_price) * 100).toFixed(2);
  }

  const avgDividend =
    historicalRecords.length > 0
      ? (
          historicalRecords.reduce(
            (acc, cur) => acc + (cur.cash_dividend || 0),
            0
          ) / historicalRecords.length
        ).toFixed(3)
      : 0;

  const avgFillDays =
    Number(metrics?.successful_fill_events || 0) > 0
      ? Number(metrics.avg_fill_days).toFixed(1)
      : null;

  return (
    <article className="prose prose-slate max-w-none">
      <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Info size={20} className="text-slate-500" />
        關於 {stock_name} ({stock_code}) 配息概況
      </h3>
      <p className="text-slate-600 leading-relaxed mb-4">
        <strong>
          {stock_name} ({stock_code})
        </strong>
        根據最新資料，該公司最新一期
        {isStockOnly ? (
          <>
            發放<strong>股票股利（配股）{Number(stock_dividend).toFixed(3)} 元</strong>。
          </>
        ) : (
          <>
            的現金股利為{" "}
            <strong>{Number(cash_dividend).toFixed(3)} 元</strong>。 以目前的最新收盤價{" "}
            <strong>{daily_price || "--"} 元</strong> 計算， 其預估單次殖利率約為{" "}
            <span className="font-bold text-slate-800">{realtimeYield}%</span>（依最新收盤價試算）。
          </>
        )}
      </p>
      <p className="text-slate-600 leading-relaxed mb-4">
        投資人若有意參與本次除權息，須注意
        <strong>{exLabel}為 {ex_date || "尚未公告"}</strong>， {isStockOnly ? "配發日" : "配息日"}:{" "}
        <strong>{pay_date || "尚未公告"}</strong>。
        {historicalRecords.length > 1 && (
          <span>
            回顧過去紀錄，{stock_name} 的歷史平均配息金額約為 {avgDividend} 元
            {avgFillDays ? (
              <>
                ，平均填息天數約為{" "}
                <strong className="text-slate-700">{avgFillDays} 天</strong>。
              </>
            ) : (
              <>。</>
            )}
          </span>
        )}
      </p>

      <h3 className="text-lg font-bold text-slate-700 mt-6 mb-2">
        如何使用 {stock_name} 股利計算機？
      </h3>
      <p className="text-slate-600 leading-relaxed mb-4">
        不想手動按計算機嗎？使用上方的<strong>「{stock_name} 股利計算機」</strong>，
        您只需輸入預計持有的張數（例如 10 張 = 10,000 股），系統即會根據最新
        {isStockOnly ? "股票股利" : "現金股利"}
        <strong>{Number(isStockOnly ? stock_dividend : cash_dividend).toFixed(3)} 元</strong>，自動計算出您可領取的總股利金額。
        此外，您也可以輸入預計投入的資金，系統會依據目前股價
        <strong>{daily_price || "--"} 元</strong>，反推您可以買進的股數與預估回報。
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          <strong>投資小撇步：</strong>
          想要領取 {stock_name} 的股利，必須在{exLabel} ({ex_date || "--"}) 的
          <strong>前一個交易日</strong>持有。
        </p>
      </div>
    </article>
  );
}
