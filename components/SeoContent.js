export default function SeoContent() {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)]">
      <div className="mx-auto max-w-4xl px-6 py-10 text-slate-600 leading-relaxed md:px-10 md:py-12">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600/75">
          Editorial Guide
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          關於 uGoodly 台股股利日曆
        </h2>
        
        <div className="mt-8 space-y-5">
          <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-6">
            <h3 className="mb-3 text-xl font-black tracking-tight text-slate-800">
              什麼是股利日曆？存股族必備的領錢行事曆
            </h3>
            <p>
              對於長期投資台股的存股族來說，最快樂的時刻莫過於「股利發放日」。然而，券商軟體通常只顯示「除息日」，
              對於實際現金入帳的「發放日」往往資訊破碎。uGoodly 股利日曆整合了<a 
                href="https://www.twse.com.tw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mx-1"
              >
                台灣證券交易所
              </a>、
              <a 
                href="https://www.tpex.org.tw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mx-1"
              >
                櫃買中心
              </a>
              以及
              <a 
                href="https://mops.twse.com.tw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mx-1"
              >
                公開資訊觀測站 (MOPS)
              </a> 的最新數據，
              將繁雜的除權息公告轉化為直覺的月曆視圖。無論您持有的是台積電、金融股，或是 0050、0056、00878 等熱門 ETF，
              都能在這裡快速查詢現金股利何時入帳。
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.24)]">
            <h3 className="mb-3 text-xl font-black tracking-tight text-slate-800">
              如何使用本網站查詢除權息與殖利率？
            </h3>
            <ul className="list-disc space-y-3 pl-5">
              <li>
                <strong>視覺化月曆：</strong>日曆上的每一個綠色圓點，都代表當天有公司發放現金股利。點擊日期即可查看詳細的發放清單與金額。
              </li>
              <li>
                <strong>高殖利率篩選：</strong>想要尋找高股息標的？點擊上方的「🔥」按鈕，系統會自動篩選出預估殖利率超過 5% 的股票與 ETF，並支援從 1% 到 20% 的自訂門檻，助您快速鎖定優質定存股。
              </li>
              <li>
                <strong>全域股票搜尋：</strong>輸入股票代號（如 2330）或名稱，系統會自動搜尋資料庫中所有的除權息紀錄，並自動跳轉至該股票最近一次配息的月份。
              </li>
              <li>
                <strong>個人化追蹤清單：</strong>點擊股票名稱旁的「愛心」圖示，即可將其加入您的專屬追蹤清單。開啟「只看追蹤」模式後，日曆將只顯示您庫存股票的領錢日，打造專屬於您的現金流地圖。
              </li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-blue-100 bg-blue-50/50 p-6">
            <h3 className="mb-3 text-xl font-black tracking-tight text-slate-800">
              資料來源與更新頻率
            </h3>
            <p>
              本網站的除權息預告資料來自「<a 
                href="https://www.twse.com.tw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mx-1"
              >
                台灣證券交易所
              </a> (TWSE)」與「<a 
                href="https://www.tpex.org.tw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mx-1"
              >
                證券櫃檯買賣中心
              </a> (TPEX)」的 Open API，
              現金股利發放日則透過「<a 
                href="https://mops.twse.com.tw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mx-1"
              >
                公開資訊觀測站 (MOPS)
              </a>」與「<a 
                href="https://www.twse.com.tw/zh/ETFortune/index" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline mx-1"
              >
                ETF e添富
              </a>」網頁資訊進行補強。
              系統會於每日晚上 20:00 更新，確保您掌握最新的配息動態與殖利率資訊。
              (註：預估殖利率係以最近一日收盤價計算，僅供參考，實際報酬率請以個人持有成本為準。)
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
