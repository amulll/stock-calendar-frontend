import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Footer from "../components/Footer";
import ToastProvider from "../components/ToastProvider";
import Providers from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://ugoodly.com'),
  title: "uGoodly 股利發放日曆｜台股配息、除權息與現金流試算",
  description: "uGoodly 台股股利發放日曆，提供入帳日查詢、近期除權息資訊、已公告殖利率、組合股息試算與自選追蹤。",
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
    title: "uGoodly 股利發放日曆｜台股配息、除權息與現金流試算",
    description: "台股股利發放日曆，提供入帳日查詢、近期除權息資訊、已公告殖利率、組合股息試算與自選追蹤。",
    url: "https://ugoodly.com",
    siteName: "uGoodly 股利日曆",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "https://ugoodly.com/ugoodly_1200x630.png", // 使用您的 Logo 或專屬封面圖
        width: 1200,
        height: 630,
        alt: "uGoodly 股利日曆 Logo",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image', // 或 'summary_large_image' (大圖版，效果較好)
    title: "uGoodly 股利發放日曆｜台股配息、除權息與現金流試算",
    description: "台股股利發放日曆，提供入帳日查詢、近期除權息資訊、已公告殖利率與組合股息試算。",
    images: ['https://ugoodly.com/ugoodly_1200x630.png'], // 與 OG 使用同一張圖即可
  },

};

// 2. 設定您的 GA4 評估 ID
const GA_MEASUREMENT_ID = 'G-42YJG79QR1'; 

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50 text-slate-900`}>
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-lg bg-blue-600 px-4 py-2.5 font-bold text-white shadow-lg transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 motion-reduce:transition-none"
        >
          跳到主要內容
        </a>

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

        <Providers>
          <ToastProvider>
            <div id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
              {children}
            </div>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
