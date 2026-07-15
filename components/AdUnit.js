"use client";

import { useState } from "react";
import { Sparkles, MessageCircle } from "lucide-react";

const QUOTES = [
  "💰 複利是世界第八大奇蹟。",
  "🌱 慢慢變富，才是最快的捷徑。",
  "📅 記得把領錢日加入行事曆喔！",
  "❤️ 點擊愛心，建立專屬追蹤清單。",
  "📉 別人恐懼時我貪婪，別人貪婪時我恐懼。",
  "🧘 投資是為了更好的生活，別讓它影響心情。",
  "🔥 試試看「高殖利率」篩選功能？",
  "🌳 最好的種樹時間是十年前，其次是現在。",
  "💎 本金是種子，股利是果實。",
  "🐈 點我一下，祝你財源廣進！"
];

export default function AdUnit({ type = "horizontal" }) {
  // type: 'horizontal' (首頁橫幅) | 'rectangle' (Modal 方形)
  
  // 預設顯示最後一句 (點我一下)
  const [quote, setQuote] = useState(QUOTES[QUOTES.length - 1]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleInteract = () => {
    setIsAnimating(true);
    // 隨機選一句
    const randomQuote = QUOTES[Math.floor(Math.random() * (QUOTES.length - 1))];
    setQuote(randomQuote);
    
    // 簡單的動畫重置
    setTimeout(() => setIsAnimating(false), 300);
  };

  const containerClass = type === "horizontal" 
    ? "w-full max-w-[728px] h-[90px]" 
    : "w-full h-[250px]";

  return (
    <button
      type="button"
      onClick={handleInteract}
      aria-label="uGoodly 廣告預留區，目前顯示隨機存股提醒"
      className={`
        ${containerClass} 
        mx-auto bg-gradient-to-r from-amber-50 to-orange-50 
        border-2 border-dashed border-amber-200 rounded-2xl 
        flex items-center justify-center cursor-pointer 
        hover:border-amber-400 hover:shadow-sm transition-all group relative overflow-hidden
        select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2
      `}
    >
      {/* 裝飾背景 */}
      <div className="absolute -right-4 -bottom-4 opacity-10 text-amber-500">
        <Sparkles size={100} />
      </div>

      <div className="flex items-center gap-4 z-10 px-4">
        
        {/* 🐱 像素貓貓 (Emoji 版，簡單可愛) */}
        <div className={`text-4xl transition-transform duration-300 motion-reduce:transition-none ${isAnimating ? "scale-125 rotate-12 motion-reduce:transform-none" : "group-hover:scale-110 motion-reduce:transform-none"}`}>
          🐱
        </div>

        {/* 對話框 */}
        <div className="flex flex-col items-start">
          <div className="bg-white px-3 py-2 rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm border border-amber-100 text-slate-600 text-sm font-medium flex items-center gap-2">
            <MessageCircle size={14} className="text-amber-400" />
            <span className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none key={quote}">
              {quote}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/60 mt-1 ml-1 font-mono">
            Sponsored by uGoodly Cat
          </span>
        </div>

      </div>
    </button>
  );
}
