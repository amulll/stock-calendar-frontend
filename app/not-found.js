// app/not-found.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h2 className="text-4xl font-bold text-slate-800 mb-4">404 - 找不到頁面</h2>
      <p className="text-slate-600 mb-8">
        哎呀！您搜尋的股票代號可能不存在，或者頁面已被移除。
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
      >
        回首頁查詢其他股票
      </Link>
    </div>
  );
}