import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "../components/Footer"; // 🆕 引入 Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "uGoodly 股利日曆 - 存股族的領錢行事曆",
  description: "查詢台股最新除權息日、現金股利發放日，並提供殖利率計算與個人化追蹤清單。",
  icons: {
    icon: '/favicon.ico', 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      {/* 加入 flex-col 與 min-h-screen 確保 Footer 永遠在底部 */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50 text-slate-900`}>
        <div className="flex-grow">
          {children}
        </div>
        <Footer /> {/* 🆕 加入 Footer */}
      </body>
    </html>
  );
}
