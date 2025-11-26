import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* 品牌與版權 */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-slate-700">uGoodly 股利日曆</h3>
            <p className="text-xs text-slate-500 mt-1">
              © {new Date().getFullYear()} uGoodly. All rights reserved.
            </p>
          </div>

          {/* 連結選單 */}
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="/disclaimer" className="hover:text-blue-600 transition">
              免責聲明
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition">
              隱私權政策
            </Link>
            <a 
              href="mailto:contact@ugoodli.com" 
              className="hover:text-blue-600 transition"
            >
              聯絡我們
            </a>
          </div>
        </div>
        
        {/* 警語區塊 (SEO & 信任感加分) */}
        <div className="mt-6 pt-6 border-t border-slate-200 text-[10px] text-slate-400 text-center md:text-left leading-relaxed">
          本網站提供之數據資料（除權息日、發放日、殖利率等）僅供參考，實際資訊請以台灣證券交易所與公開資訊觀測站公告為準。
          本網站不進行任何投資建議，使用者應自行承擔投資風險。
        </div>
      </div>
    </footer>
  );
}