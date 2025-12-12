import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script"; // 1. 引入 Script 組件
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "uGoodly 股利日曆｜台股除權息與現金股利發放日行事曆",
  description: "uGoodly 專為台股存股族打造的股利行事曆。快速查詢最新除權息日、現金股利發放日，提供個股與ETF殖利率計算、高殖利率篩選及追蹤清單，輕鬆掌握領息時間。",
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
  openGraph: {
    title: "uGoodly 股利日曆 - 存股族的領錢行事曆",
    description: "最直覺的台股除權息行事曆。查詢發放日、殖利率試算，不錯過每一筆股息。",
    url: "https://ugoodly.com",
    siteName: "uGoodly 股利日曆",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "https://ugoodly.com/ugoodly_1200x630.png", // 使用您的 Logo 或專屬封面圖
        width: 192,
        height: 192,
        alt: "uGoodly 股利日曆 Logo",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image', // 或 'summary_large_image' (大圖版，效果較好)
    title: "uGoodly 股利日曆 - 存股族的領錢行事曆",
    description: "最直覺的台股除權息行事曆。查詢發放日、殖利率試算，不錯過每一筆股息。",
    images: ['https://ugoodly.com/ugoodly_1200x630.png'], // 與 OG 使用同一張圖即可
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