// app/privacy/page.js

export const metadata = {
  title: "隱私權政策 - uGoodly 股利日曆",
  // 👇 修改這裡：更精簡的描述
  description: "查看 uGoodly 股利日曆隱私權政策。說明我們如何收集與保護您的個人資料，以及關於 Cookie 與第三方服務的使用規範。",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto my-6 max-w-4xl px-4 md:my-8 md:px-8">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        Privacy
      </p>
      <h1 className="mb-6 text-3xl font-black tracking-tight text-slate-950">隱私權政策 (Privacy Policy)</h1>
      
      <div className="space-y-6 text-slate-600 leading-relaxed">
        <p>生效日期：2024年5月26日</p>
        
        <section>
          <h2 className="mb-2 text-lg font-black tracking-tight text-slate-800">1. 我們收集的資訊</h2>
          <p>
            本網站目前<strong>不需要註冊帳號</strong>即可使用。
            我們使用瀏覽器的 LocalStorage 技術來儲存您的「追蹤清單」與「偏好設定」，這些資料僅儲存在您的裝置端，本網站伺服器不會進行蒐集或備份。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-black tracking-tight text-slate-800">2. Cookie 與第三方服務</h2>
          <p>
            本網站可能會使用第三方服務（如 Google Analytics、Google AdSense）來分析流量或投放廣告。
            這些第三方服務可能會使用 Cookie 技術來蒐集非識別個人的使用數據（如瀏覽頁面、停留時間等），以優化使用者體驗。
            您可以透過瀏覽器設定拒絕 Cookie，但這可能會影響部分功能的使用。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-black tracking-tight text-slate-800">3. 資料安全</h2>
          <p>
            我們致力於保護您的使用數據，並採取合理的技術措施防止未經授權的存取。
            然而，網際網路傳輸無法保證 100% 安全，請您理解並自行承擔相關風險。
          </p>
        </section>
        
        <section>
          <h2 className="mb-2 text-lg font-black tracking-tight text-slate-800">4. 聯絡我們</h2>
          <p>
            若您對本隱私權政策有任何疑問，請透過電子郵件與我們聯繫：contact@ugoodly.com
          </p>
        </section>
      </div>
      </article>
    </main>
  );
}
