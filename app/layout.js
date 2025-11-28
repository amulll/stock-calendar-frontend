import "./globals.css";
import { Noto_Sans_TC } from "next/font/google";
import Script from "next/script"; 
import Footer from "../components/Footer";

// 設定字體：使用 M PLUS Rounded 1c
const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500", "700"], // 選擇您需要的粗細
  subsets: ["latin"], 
  display: "swap",
  // Next.js 對 Noto Sans TC 的優化通常比較好，不需要關閉 preload，但如果還是一樣慢，可以設為 false
});
export const metadata = {
  title: "uGoodly 股利日曆 - 存股族的領錢行事曆",
  description: "查詢台股最新除權息日、現金股利發放日，並提供殖利率計算與個人化追蹤清單。",
  icons: {
    icon: '/favicon.ico', 
  },
};

// 設定您的 GA4 評估 ID
const GA_MEASUREMENT_ID = 'G-42YJG79QR1'; 

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSansTC.className} flex flex-col min-h-screen bg-slate-50 text-slate-900`}>
        
        {/* Google Analytics 腳本 (lazyOnload 優化效能) */}
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