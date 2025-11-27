import React from 'react';

export default function Loading({ text = "正在查詢資料...", scale = 1 }) {
  // 根據傳入的 scale 計算 style，用於整體縮放
  const containerStyle = {
    transform: `scale(${scale})`,
    // 如果是在 Modal 等小區域，建議 origin 設為 center，全螢幕則可以是 top center
    transformOrigin: scale < 1 ? "center" : "top center", 
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[250px] overflow-hidden p-4">
      
      {/* 🎨 動畫場景容器 (狗狗 + 日曆) */}
      <div className="loading-scene" style={containerStyle}>
        
        {/* 🐕 金黃色站立狗狗 */}
        <div className="golden-dog">
          <div className="tail"></div>
          <div className="leg bl"></div>
          <div className="leg br"></div>
          <div className="body"></div>
          <div className="leg fl"></div>
          <div className="leg fr"></div>
          <div className="head">
            <div className="ear left"></div>
            <div className="ear right"></div>
            <div className="head-shape">
              <div className="eyes">
                <div className="eye"></div>
                <div className="eye"></div>
              </div>
              <div className="snout">
                <div className="nose"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 📅 翻頁日曆 */}
        <div className="flipping-calendar">
          <div className="calendar-binder">
            <div className="binder-ring"></div>
            <div className="binder-ring"></div>
          </div>
          <div className="calendar-page-base">
            <span>...</span>
          </div>
          <div className="calendar-flipper">
            <div className="front">
              {/* 這裡可以放 "載入中" 或日期 */}
              <span className="translate-y-1/2">LOAD</span>
            </div>
            <div className="back">
              <span className="-translate-y-1/2">ING</span>
            </div>
          </div>
        </div>

      </div>

      {/* 文字提示 (位置往下調一點) */}
      <p className="mt-8 text-slate-500 font-medium text-sm tracking-wider animate-pulse bg-white/90 px-5 py-2 rounded-full border border-slate-200 shadow-sm z-10 relative">
        {text}
      </p>
    </div>
  );
}