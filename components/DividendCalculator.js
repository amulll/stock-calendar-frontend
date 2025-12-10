"use client";

import { useState } from "react";
import { Calculator, RefreshCcw } from "lucide-react";

export default function DividendCalculator({ stockName, cashDividend, stockPrice }) {
  const [shares, setShares] = useState(1000); // 預設 1 張 (1000股)
  const [investment, setInvestment] = useState(""); // 用金額回推股數模式

  const dividendAmount = shares * cashDividend;
  const marketValue = shares * stockPrice;
  const yieldRate = stockPrice > 0 ? ((cashDividend / stockPrice) * 100).toFixed(2) : 0;

  // 處理股數變更
  const handleSharesChange = (e) => {
    const val = Number(e.target.value);
    setShares(val);
    setInvestment(""); // 清空金額模式
  };

  // 處理金額變更 (自動換算股數)
  const handleInvestmentChange = (e) => {
    const val = Number(e.target.value);
    setInvestment(val);
    if (stockPrice > 0) {
      setShares(Math.floor(val / stockPrice));
    }
  };

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
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">持有股數 (股)</label>
            <div className="relative">
                <input 
                    type="number" 
                    value={shares}
                    onChange={handleSharesChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">股</span>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => setShares(1000)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">1張</button>
                <button onClick={() => setShares(5000)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">5張</button>
                <button onClick={() => setShares(10000)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">10張</button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">或是</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">預計投入金額 (元)</label>
            <div className="relative">
                <input 
                    type="number" 
                    value={investment}
                    onChange={handleInvestmentChange}
                    placeholder={`以股價 ${stockPrice} 元試算...`}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg font-mono font-bold text-slate-700 placeholder:font-normal"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">$</span>
            </div>
          </div>
        </div>

        {/* 結果區 */}
        <div className="bg-slate-50 rounded-xl p-5 flex flex-col justify-center space-y-4 border border-slate-100">
            <div className="flex justify-between items-end pb-4 border-b border-slate-200">
                <div className="text-sm text-slate-500">預估領取股利</div>
                <div className="text-3xl font-bold text-emerald-600">
                    ${Math.round(dividendAmount).toLocaleString()}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-slate-400 mb-1">持有成本市值</div>
                    <div className="font-bold text-slate-700">${Math.round(marketValue).toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-400 mb-1">當期殖利率</div>
                    <div className="font-bold text-amber-500">{yieldRate}%</div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}