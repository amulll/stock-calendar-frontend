import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script"; // 1. 引入 Script 組件
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "uGoodly 股利日曆 - 存股族的領錢行事曆",
  description: "...",
  icons: {
    // 舊的 ico 留著給舊瀏覽器用
    icon: [
      { url: '/favicon.ico' },
      // 👇 新增這行：指定高解析度 PNG，Google 搜尋會優先抓這個
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    // 建議也補上 Apple 裝置圖示 (通常也是用大圖)
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

// 2. 設定您的 GA4 評估 ID
const GA_MEASUREMENT_ID = 'G-42YJG79QR1'; 

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50 text-slate-900`}>
        
        {/* 3. Google Analytics 腳本 (放在 body 內) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload" 
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        <div className="flex-grow">
          {children}
        </div>
        <Footer /> 
      </body>
    </html>
  );
}