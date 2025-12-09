// app/disclaimer/page.js

export const metadata = {
  title: "免責聲明 - uGoodly 股利日曆",
  // 👇 這個長度 (65字) 其實 OK，維持原樣或微調皆可
  description: "閱讀 uGoodly 股利日曆的免責聲明。本網站提供之除權息與殖利率數據僅供參考，不構成投資建議，使用者應自行審慎評估風險。",
};

export default function DisclaimerPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 bg-white my-8 rounded-2xl shadow-sm border border-slate-100">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">免責聲明 (Disclaimer)</h1>
      
      <div className="space-y-6 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-700 mb-2">1. 資料來源與準確性</h2>
          <p>
            「uGoodly」(以下簡稱本網站) 所有數據資料來源均為台灣證券交易所、證券櫃檯買賣中心及公開資訊觀測站。
            本網站盡力確保所提供資訊之準確性與即時性，但不對任何錯誤、遺漏或因使用這些資訊而導致的結果承擔法律責任。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-700 mb-2">2. 非投資建議</h2>
          <p>
            本網站所提供的所有資訊（包含但不限於除權息日期、股利金額、殖利率計算、歷史數據等）僅供參考與學術研究用途，
            <strong>不構成任何形式的投資建議、買賣要約或誘導</strong>。
            使用者在進行任何投資決策前，應自行審慎評估風險，並諮詢專業財務顧問。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-700 mb-2">3. 服務中斷與免責</h2>
          <p>
            本網站不保證服務之不中斷或無錯誤。對於因技術故障、網路連線問題、第三方資料源中斷或其他不可抗力因素導致的服務暫停或資料缺失，
            本網站不負擔任何賠償責任。
          </p>
        </section>
      </div>
    </main>
  );
}