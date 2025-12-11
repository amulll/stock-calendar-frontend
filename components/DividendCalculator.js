"use client";

import { useState, useEffect, useRef } from "react";
import { Calculator } from "lucide-react";

export default function DividendCalculator({ stockName, cashDividend, stockPrice }) {
  // --- 1. 狀態管理 (全部使用字串以支援逗號與小數點輸入) ---
  const [priceStr, setPriceStr] = useState("");
  const [sharesStr, setSharesStr] = useState("1,000");
  const [investStr, setInvestStr] = useState("");

  // 綁定 DOM 元素以處理滾輪事件
  const priceRef = useRef(null);
  const sharesRef = useRef(null);
  const investRef = useRef(null);

  // --- 2. 初始化與同步 ---
  useEffect(() => {
    if (stockPrice) {
      const pStr = formatNumber(stockPrice); // 預設保留原樣 (含小數)
      setPriceStr(pStr);
      
      // 計算預設投入 (1000股)
      const defaultShares = 1000;
      const total = defaultShares * stockPrice;
      
      setSharesStr(formatNumber(defaultShares, 0)); // 股數不含小數
      setInvestStr(formatNumber(Math.floor(total), 0)); // 金額取整
    }
  }, [stockPrice]);

  // --- 3. 核心工具函式 ---

  // 字串轉數字 (移除逗號)
  const parseVal = (str) => {
    if (!str) return 0;
    // 移除逗號後轉浮點數
    const cleanStr = str.toString().replace(/,/g, "");
    return parseFloat(cleanStr);
  };

  // 數字轉千分位字串
  // decimals: 指定小數位數，undefined 代表不處理(保留原樣), 0 代表整數
  const formatNumber = (val, decimals) => {
    if (val === "" || val === undefined || isNaN(val)) return "";
    
    let num = Number(val);
    if (decimals !== undefined) {
        // 如果有指定位數 (例如金額 0)，就四捨五入
        // 但為了輸入體驗，通常我們只在計算結果輸出時強制位數
        // 輸入時我們只加逗號
        if (decimals === 0) num = Math.floor(num);
    }

    // 轉字串並加逗號
    // 注意：這裡使用簡單的正則，不更動小數點
    const parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // 處理輸入格式化 (允許輸入 "1,000.")
  const formatInput = (raw) => {
    // 1. 移除舊逗號
    const val = raw.replace(/,/g, "");
    if (val === "") return "";
    if (isNaN(Number(val)) && val !== "." && val !== "-") return raw; // 非數字不處理 (除了正在打小數點)

    // 2. 加上逗號 (保留小數點)
    const parts = val.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // 限制只能有一個小數點
    if (parts.length > 2) return raw; 
    
    return parts.join(".");
  };

  // --- 4. 輸入變更處理 (雙向連動) ---

  // A. 改股價 -> 變更 金額 (股數不變)
  const handlePriceChange = (e) => {
    const newStr = formatInput(e.target.value);
    setPriceStr(newStr);
    
    const p = parseVal(newStr);
    const s = parseVal(sharesStr);
    
    if (!isNaN(p) && !isNaN(s)) {
        setInvestStr(formatNumber(Math.floor(p * s), 0));
    }
  };

  // B. 改股數 -> 變更 金額 (股價不變)
  const handleSharesChange = (e) => { // 這裡 e 可能是 event 或直接數值
    let val = e.target ? e.target.value : e;
    const newStr = formatInput(String(val));
    setSharesStr(newStr);

    const s = parseVal(newStr);
    const p = parseVal(priceStr);

    if (!isNaN(s) && !isNaN(p)) {
        setInvestStr(formatNumber(Math.floor(s * p), 0));
    }
  };

  // C. 改金額 -> 變更 股數 (股價不變)
  const handleInvestChange = (e) => {
    const newStr = formatInput(e.target.value);
    setInvestStr(newStr);

    const i = parseVal(newStr);
    const p = parseVal(priceStr);

    if (!isNaN(i) && p > 0) {
        const newShares = Math.floor(i / p);
        setSharesStr(formatNumber(newShares, 0));
    }
  };

  // --- 5. 滾輪事件處理 (防止頁面捲動) ---
  
  // 我們使用 useEffect 直接綁定原生事件，因為 React 的 onWheel 無法將 passive 設為 false
  useEffect(() => {
    const handleNativeWheel = (e, type) => {
        // 只有當元素是 focus 狀態時才觸發
        if (document.activeElement === e.target) {
            e.preventDefault(); // 🛑 這是關鍵：阻止瀏覽器預設的滾動行為

            const delta = e.deltaY > 0 ? -1 : 1; // 往上滾(+), 往下滾(-)

            if (type === 'price') {
                const current = parseVal(priceRef.current.value);
                const step = 0.5;
                const next = Math.max(0, current + delta * step);
                
                // 模擬 Event 呼叫 handler
                handlePriceChange({ target: { value: next.toFixed(1) } }); // 格式化為小數

            } else if (type === 'shares') {
                const current = parseVal(sharesRef.current.value);
                const step = 100; // 股數一次跳 100
                const next = Math.max(0, current + delta * step);
                
                handleSharesChange({ target: { value: String(next) } });

            } else if (type === 'invest') {
                const current = parseVal(investRef.current.value);
                const step = 10000; // 金額一次跳 1萬
                const next = Math.max(0, current + delta * step);
                
                handleInvestChange({ target: { value: String(next) } });
            }
        }
    };

    // 分別綁定三個輸入框
    const pNode = priceRef.current;
    const sNode = sharesRef.current;
    const iNode = investRef.current;

    const pHandler = (e) => handleNativeWheel(e, 'price');
    const sHandler = (e) => handleNativeWheel(e, 'shares');
    const iHandler = (e) => handleNativeWheel(e, 'invest');

    if (pNode) pNode.addEventListener('wheel', pHandler, { passive: false });
    if (sNode) sNode.addEventListener('wheel', sHandler, { passive: false });
    if (iNode) iNode.addEventListener('wheel', iHandler, { passive: false });

    return () => {
        if (pNode) pNode.removeEventListener('wheel', pHandler);
        if (sNode) sNode.removeEventListener('wheel', sHandler);
        if (iNode) iNode.removeEventListener('wheel', iHandler);
    };
  }, [priceStr, sharesStr, investStr]); // 依賴變數，確保 handler 拿到最新值

  // --- 6. 計算顯示結果 ---
  const currentPrice = parseVal(priceStr);
  const currentShares = parseVal(sharesStr);
  
  const totalDividend = currentShares * cashDividend;
  const totalMarketValue = currentShares * currentPrice;
  const calculatedYield = currentPrice > 0 
    ? ((cashDividend / currentPrice) * 100).toFixed(2) 
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-white flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Calculator size={20} className="flex-shrink-0" /> 
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 leading-tight md:leading-normal">
            <span>{stockName}</span>
            <span>股利計算機</span>
          </div>
        </h3>
        {/* 右側標籤 (建議加上 whitespace-nowrap 防止換行太醜) */}
        <span className="text-xs bg-white/20 px-2 py-1 rounded whitespace-nowrap ml-2">
            現金股利: {cashDividend} 元
        </span>
      </div>
      
      <div className="p-6 grid md:grid-cols-2 gap-8">
        
        {/* 輸入區 */}
        <div className="space-y-4">
          
          {/* 1. 股價輸入 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">參考股價 (可修改)</label>
            <div className="relative">
                <input 
                    ref={priceRef}
                    type="text" 
                    inputMode="decimal"
                    value={priceStr}
                    onChange={handlePriceChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700 bg-slate-50 focus:bg-white transition"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">元</span>
            </div>
            <div className="flex gap-2 mt-1 justify-end">
                <button 
                    onClick={() => {
                        // 重置按鈕
                        const pStr = formatNumber(stockPrice);
                        setPriceStr(pStr);
                        const s = parseVal(sharesStr);
                        setInvestStr(formatNumber(Math.floor(s * stockPrice), 0));
                    }} 
                    className="text-[10px] text-violet-600 hover:underline flex items-center gap-1"
                >
                    重置為最新收盤價 (${stockPrice})
                </button>
            </div>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          {/* 2. 股數輸入 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">持有股數 (股)</label>
            <div className="relative">
                <input 
                    ref={sharesRef}
                    type="text" 
                    inputMode="numeric"
                    value={sharesStr}
                    onChange={handleSharesChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">股</span>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => handleSharesChange(1000)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">1張</button>
                <button onClick={() => handleSharesChange(5000)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">5張</button>
                <button onClick={() => handleSharesChange(10000)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">10張</button>
            </div>
          </div>

          {/* 3. 金額輸入 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-bold text-slate-700">預計投入金額</label>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">自動換算</span>
            </div>
            <div className="relative">
                <input 
                    ref={investRef}
                    type="text" 
                    inputMode="numeric"
                    value={investStr}
                    onChange={handleInvestChange}
                    placeholder={`以股價 ${priceStr} 元試算...`}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700 placeholder:font-normal"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">$</span>
            </div>
          </div>
        </div>

        {/* 結果區 */}
        <div className="bg-slate-50 rounded-xl p-5 flex flex-col justify-center space-y-6 border border-slate-100">
            
            {/* 試算殖利率 (隨股價變動) */}
            <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">試算殖利率</div>
                <div className="text-4xl font-extrabold text-amber-500 tracking-tight">
                    {calculatedYield}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                    ( 配息 {cashDividend} ÷ 股價 {priceStr} )
                </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">預估領取股利</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        ${formatNumber(Math.round(totalDividend), 0)}
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">持有成本市值</div>
                    <div className="text-xl font-bold text-slate-700">
                        ${formatNumber(Math.round(totalMarketValue), 0)}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}