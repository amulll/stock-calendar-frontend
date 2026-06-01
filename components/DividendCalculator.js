"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Calculator } from "lucide-react";

export default function DividendCalculator({ stockName, cashDividend, stockPrice }) {
  // 1. 狀態管理 (全部儲存為「帶逗號的字串」)
  const [priceStr, setPriceStr] = useState("");
  const [sharesStr, setSharesStr] = useState("1,000");
  const [investStr, setInvestStr] = useState("");

  // 綁定 DOM 元素
  const priceRef = useRef(null);
  const sharesRef = useRef(null);
  const investRef = useRef(null);

  // 游標位置紀錄 (用於解決游標跳動問題)
  const cursorRef = useRef(null);

  // 2. 初始化：當外部 props 更新時，重置計算
  useEffect(() => {
    if (stockPrice) {
      const pStr = formatValue(stockPrice); 
      setPriceStr(pStr);
      
      const defaultShares = 1000;
      const total = defaultShares * stockPrice;
      
      setSharesStr(formatValue(defaultShares)); 
      setInvestStr(formatValue(Math.floor(total))); 
    }
  }, [stockPrice]);

  // --- 3. 核心工具函式 ---

  // 數值 -> 帶逗號字串 (支援小數)
  const formatValue = (val) => {
    if (val === "" || val === undefined || isNaN(Number(val))) return "";
    
    const str = val.toString();
    const parts = str.split(".");
    // 整數部分加逗號
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // 帶逗號字串 -> 純數字
  const parseVal = (str) => {
    if (!str) return 0;
    const cleanStr = str.toString().replace(/,/g, "");
    return parseFloat(cleanStr);
  };

  // 輸入格式化：允許輸入過程中的小數點，並即時加逗號
  const formatInput = (raw) => {
    // 移除舊逗號
    const val = raw.replace(/,/g, "");
    if (val === "") return "";
    
    // 允許輸入小數點或負號 (雖然這裡不應該有負號)
    if (isNaN(Number(val)) && val !== "." && !val.endsWith(".")) return raw;

    const parts = val.split(".");
    // 限制整數部分長度 (避免爆掉) & 加逗號
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // 限制只能有一個小數點
    if (parts.length > 2) return raw; 
    
    return parts.join(".");
  };

  // --- 4. 游標管理 Hook (核心魔法 🪄) ---
  // 在 DOM 更新後，立即計算並恢復游標位置
  useLayoutEffect(() => {
    if (cursorRef.current && cursorRef.current.element) {
        const { element, start, lengthBefore } = cursorRef.current;
        const lengthAfter = element.value.length;
        
        // 算法：新位置 = 舊位置 + (新字串長度 - 舊字串長度)
        // 這樣當逗號增加或減少時，游標會跟著移動，不會被擠到後面
        const newPos = Math.max(0, start + (lengthAfter - lengthBefore));
        
        element.setSelectionRange(newPos, newPos);
        cursorRef.current = null; // 重置
    }
  }, [priceStr, sharesStr, investStr]);

  // 通用變更處理器 (包裝了游標記錄邏輯)
  const handleChangeWithCursor = (e, setValue, callback) => {
    const element = e.target;
    // 1. 記錄變更前的游標與長度
    cursorRef.current = {
        element,
        start: element.selectionStart,
        lengthBefore: element.value.length
    };

    // 2. 格式化新值
    const newStr = formatInput(e.target.value);
    
    // 3. 更新狀態 (這會觸發 re-render -> useLayoutEffect)
    setValue(newStr);
    
    // 4. 執行連動計算
    if (callback) callback(newStr);
  };

  // --- 5. 輸入邏輯 (雙向連動) ---

  const handlePriceChange = (e) => {
    handleChangeWithCursor(e, setPriceStr, (newStr) => {
        const p = parseVal(newStr);
        const s = parseVal(sharesStr);
        if (!isNaN(p) && !isNaN(s)) {
            // 連動計算金額 (取整數)
            setInvestStr(formatValue(Math.floor(p * s)));
        }
    });
  };

  const handleSharesChange = (e) => { 
    // 如果是快速按鈕 (直接傳數值)，不需處理游標
    if (!e.target) {
        const val = String(e);
        const newStr = formatValue(val);
        setSharesStr(newStr);
        const s = parseVal(newStr);
        const p = parseVal(priceStr);
        if (!isNaN(s) && !isNaN(p)) {
            setInvestStr(formatValue(Math.floor(s * p)));
        }
        return;
    }

    handleChangeWithCursor(e, setSharesStr, (newStr) => {
        const s = parseVal(newStr);
        const p = parseVal(priceStr);
        if (!isNaN(s) && !isNaN(p)) {
            setInvestStr(formatValue(Math.floor(s * p)));
        }
    });
  };

  const handleInvestChange = (e) => {
    handleChangeWithCursor(e, setInvestStr, (newStr) => {
        const i = parseVal(newStr);
        const p = parseVal(priceStr);
        if (!isNaN(i) && p > 0) {
            // 連動計算股數 (取整數)
            setSharesStr(formatValue(Math.floor(i / p)));
        }
    });
  };

  // --- 6. 滾輪邏輯 (防滾動 + 數值微調) ---
  useEffect(() => {
    const handleNativeWheel = (e, type) => {
        // 只有在 focus 時才觸發
        if (document.activeElement === e.target) {
            e.preventDefault(); // 🛑 阻止頁面捲動

            const delta = e.deltaY > 0 ? -1 : 1; 

            if (type === 'price') {
                const current = parseVal(priceRef.current.value);
                const step = 0.5;
                const next = Math.max(0, current + delta * step);
                
                // 模擬 Event 呼叫 handler (toFixed 避免浮點數誤差)
                handlePriceChange({ target: { value: next.toFixed(1) } });

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

    const pNode = priceRef.current;
    const sNode = sharesRef.current;
    const iNode = investRef.current;

    // 使用 passive: false 才能 preventDefault
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
  }, [priceStr, sharesStr, investStr]); 

  // --- 7. 計算最終結果 ---
  const currentPrice = parseVal(priceStr);
  const currentShares = parseVal(sharesStr);
  
  const totalDividend = currentShares * cashDividend;
  const totalMarketValue = currentShares * currentPrice;
  const calculatedYield = currentPrice > 0 
    ? ((cashDividend / currentPrice) * 100).toFixed(2) 
    : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col items-start gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 font-black tracking-tight">
          <Calculator size={18} className="flex-shrink-0 text-slate-500" />
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 leading-tight md:leading-normal">
            <span>{stockName}</span>
            <span>股利計算機</span>
          </div>
        </h3>
        <span className="whitespace-nowrap rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 sm:ml-2">
            現金股利: {cashDividend} 元
        </span>
      </div>
      
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_0.9fr]">
        
        {/* 輸入區 */}
        <div className="space-y-3 md:space-y-4">
          
          {/* 1. 股價輸入 */}
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">參考股價 (可修改)</label>
            <div className="relative">
                <input 
                    ref={priceRef}
                    type="text" 
                    inputMode="decimal"
                    value={priceStr}
                    onChange={handlePriceChange}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-base font-bold text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-500 md:p-3 md:text-lg"
                />
                <span className="absolute right-4 top-3 text-sm text-slate-400 md:top-3.5">元</span>
            </div>
            <div className="flex gap-2 mt-1 justify-end">
                <button 
                    onClick={() => {
                        const pStr = formatValue(stockPrice);
                        setPriceStr(pStr);
                        const s = parseVal(sharesStr);
                        setInvestStr(formatValue(Math.floor(s * stockPrice)));
                    }} 
                    className="flex items-center gap-1 text-[10px] text-emerald-700 hover:underline"
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
                    className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-base font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 md:p-3 md:text-lg"
                />
                <span className="absolute right-4 top-3 text-sm text-slate-400 md:top-3.5">股</span>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => handleSharesChange(1000)} className="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200">1張</button>
                <button onClick={() => handleSharesChange(5000)} className="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200">5張</button>
                <button onClick={() => handleSharesChange(10000)} className="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200">10張</button>
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
                    className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-base font-bold text-slate-700 outline-none placeholder:font-normal focus:ring-2 focus:ring-emerald-500 md:p-3 md:text-lg"
                />
                <span className="absolute right-4 top-3 text-sm text-slate-400 md:top-3.5">$</span>
            </div>
          </div>
        </div>

        {/* 結果區 */}
        <div className="flex flex-col justify-center space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:space-y-5">
            
            <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">試算殖利率</div>
                <div className="text-3xl font-extrabold tracking-tight text-amber-600 md:text-4xl">
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
                        ${formatValue(Math.round(totalDividend))}
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">持有成本市值</div>
                    <div className="text-xl font-bold text-slate-700">
                        ${formatValue(Math.round(totalMarketValue))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
