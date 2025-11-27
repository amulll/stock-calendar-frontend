export default function Loading({ text = "努力搬運中...", scale = 1 }) {
  // 根據傳入的 scale 計算 style，用於縮放狗狗
  const containerStyle = {
    transform: `scale(${scale})`,
    transformOrigin: "center",
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] overflow-hidden">
      {/* 🐶 CSS 狗狗動畫 */}
      <div className="dog-loader" style={containerStyle}>
        <div className="dog">
          <div className="dog__paws">
            <div className="dog__bl-leg leg">
              <div className="dog__bl-paw paw"></div>
              <div className="dog__bl-top top"></div>
            </div>
            <div className="dog__fl-leg leg">
              <div className="dog__fl-paw paw"></div>
              <div className="dog__fl-top top"></div>
            </div>
            <div className="dog__fr-leg leg">
              <div className="dog__fr-paw paw"></div>
              <div className="dog__fr-top top"></div>
            </div>
          </div>
          
          <div className="dog__body">
            <div className="dog__tail"></div>
          </div>
          
          <div className="dog__head">
            <div className="dog__snout">
              <div className="dog__nose"></div>
              <div className="dog__eyes">
                <div className="dog__eye-l"></div>
                <div className="dog__eye-r"></div>
              </div>
            </div>
          </div>
          
          <div className="dog__head-c">
            <div className="dog__ear-l"></div>
            <div className="dog__ear-r"></div>
          </div>
        </div>
      </div>

      {/* 文字提示 (位置往上調一點，避免離狗狗太遠) */}
      <p className="relative -top-8 text-slate-500 font-medium text-sm tracking-wider animate-pulse bg-white/80 px-5 py-2 rounded-full border border-slate-200 shadow-sm z-10">
        {text}
      </p>
    </div>
  );
}