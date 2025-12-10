"use client";

import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";

export default function DividendCalculator({ stockName, cashDividend, stockPrice }) {
  // 1. 核心數據狀態
  // customPrice: 預設為傳入的股價，但可編輯
  const [customPrice, setCustomPrice] = useState(stockPrice || 0);
  const [shares, setShares] = useState(1000); 
  const [investment, setInvestment] = useState(""); 

  // 2. 初始化與同步
  // 當頁面切換到不同股票時，重置股價為該股票的最新價格
  useEffect(() => {
    if (stockPrice) {
      setCustomPrice(stockPrice);
      // 根據新股價重算預設投入金額 (預設 1 張)
      setInvestment(formatNumber(1000 * stockPrice));
      setShares(1000);
    }
  }, [stockPrice]);

  // 輔助函式：數值轉千分位字串
  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    // 移除小數點後多餘位數 (股價可能會有小數，金額取整數)
    const val = Number(num);
    // 如果是整數就直接轉，如果有小數則保留兩位 (針對股價)
    const str = Number.isInteger(val) ? val.toString() : val.toFixed(2);
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 輔助函式：千分位字串轉數值
  const parseNumber = (str) => {
    if (!str) return 0;
    return Number(str.toString().replace(/,/g, ""));
  };

  // ---------------------------------------------
  // A. 處理股價變更 -> 連動更新金額 (股數不變)
  // ---------------------------------------------
  const handlePriceChange = (e) => {
    const rawVal = parseNumber(e.target.value);
    setCustomPrice(rawVal);
    
    // 股價變動時，假設持有股數不變，更新市值
    const newInvest = shares * rawVal;
    setInvestment(formatNumber(newInvest));
  };

  // ---------------------------------------------
  // B. 處理股數變更 -> 自動計算金額
  // ---------------------------------------------
  const handleSharesChange = (e) => {
    const rawVal = parseNumber(e.target.value);
    setShares(rawVal);
    
    // 連動更新金額
    if (customPrice > 0) {
      const newInvest = rawVal * customPrice;
      setInvestment(formatNumber(newInvest));
    }
  };

  // ---------------------------------------------
  // C. 處理金額變更 -> 自動計算股數
  // ---------------------------------------------
  const handleInvestmentChange = (e) => {
    const valStr = e.target.value;
    const rawValue = parseNumber(valStr);
    
    const formatted = formatNumber(rawValue);
    
    if (valStr === "" || !isNaN(rawValue)) {
        setInvestment(formatted);
        
        // 連動更新股數
        if (customPrice > 0) {
           const newShares = Math.floor(rawValue / customPrice);
           setShares(newShares);
        }
    }
  };

  // ---------------------------------------------
  // D. 處理滑鼠滾輪 (防止視窗捲動 + 調整數值)
  // ---------------------------------------------
  const handleWheel = (e, type) => {
    if (document.activeElement === e.target) {
        e.preventDefault(); 
        
        const delta = e.deltaY > 0 ? -1 : 1;
        
        if (type === 'price') {
            // 股價微調：每滾一下 +/- 0.5 元 (可依需求調整)
            const step = 0.5;
            const newPrice = Math.max(0, customPrice + delta * step);
            setCustomPrice(newPrice);
            setInvestment(formatNumber(shares * newPrice));

        } else if (type === 'shares') {
            const step = 100; 
            const newShares = Math.max(0, shares + delta * step);
            setShares(newShares);
            setInvestment(formatNumber(newShares * customPrice));
            
        } else if (type === 'investment') {
            const currentInvest = parseNumber(investment);
            const step = 5000;
            const newInvest = Math.max(0, currentInvest + delta * step);
            setInvestment(formatNumber(newInvest));
            if (customPrice > 0) setShares(Math.floor(newInvest / customPrice));
        }
    }
  };

  // 計算結果 (全部使用 customPrice)
  const dividendAmount = shares * cashDividend;
  const marketValue = shares * customPrice;
  const yieldRate = customPrice > 0 ? ((cashDividend / customPrice) * 100).toFixed(2) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-white flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Calculator size={20} /> 
          {stockName} 股利試算機
        </h3>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">現金股利: {cashDividend} 元</span>
      </div>
      
      <div className="p-6 grid md:grid-cols-2 gap-8">
        
        {/* 輸入區 */}
        <div className="space-y-4">
          
          {/* 1. 參考股價 (新增欄位) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">參考股價 (可修改)</label>
            <div className="relative">
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={formatNumber(customPrice)}
                    onChange={handlePriceChange}
                    onWheel={(e) => handleWheel(e, 'price')}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700 bg-slate-50 focus:bg-white transition"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">元</span>
            </div>
            <div className="flex gap-2 mt-1 justify-end">
                {/* 快速按鈕：重置回最新收盤價 */}
                <button 
                    onClick={() => {
                        setCustomPrice(stockPrice);
                        setInvestment(formatNumber(shares * stockPrice));
                    }} 
                    className="text-[10px] text-violet-600 hover:underline flex items-center gap-1"
                >
                    重置為最新收盤價 (${stockPrice})
                </button>
            </div>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          {/* 2. 持有股數 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">持有股數 (股)</label>
            <div className="relative">
                <input 
                    type="text" 
                    inputMode="numeric"
                    value={formatNumber(shares)}
                    onChange={handleSharesChange}
                    onWheel={(e) => handleWheel(e, 'shares')}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">股</span>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => handleSharesChange({target: {value: 1000}})} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">1張</button>
                <button onClick={() => handleSharesChange({target: {value: 5000}})} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">5張</button>
                <button onClick={() => handleSharesChange({target: {value: 10000}})} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">10張</button>
            </div>
          </div>

          {/* 3. 投入金額 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-bold text-slate-700">預計投入金額</label>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">自動換算</span>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    inputMode="numeric"
                    value={investment}
                    onChange={handleInvestmentChange}
                    onWheel={(e) => handleWheel(e, 'investment')}
                    placeholder={`以股價 ${customPrice} 元試算...`}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700 placeholder:font-normal"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">$</span>
            </div>
          </div>
        </div>

        {/* 結果區 */}
        <div className="bg-slate-50 rounded-xl p-5 flex flex-col justify-center space-y-6 border border-slate-100">
            
            {/* 試算殖利率 (這個會隨股價變動) */}
            <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">試算殖利率</div>
                <div className="text-4xl font-extrabold text-amber-500 tracking-tight">
                    {yieldRate}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                    ( 配息 {cashDividend} ÷ 股價 {formatNumber(customPrice)} )
                </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">預估領取股利</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        ${formatNumber(Math.round(dividendAmount))}
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">持有成本市值</div>
                    <div className="text-xl font-bold text-slate-700">
                        ${formatNumber(Math.round(marketValue))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}