"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function DividendChart({ history }) {
  // 1. 狀態管理：控制目前是「年度」還是「明細」模式
  const [viewMode, setViewMode] = useState("annual"); // 'annual' | 'detail'

  // 2. 資料處理：年度模式 (由舊到新，合併同一年份)
  const annualData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const yearMap = new Map();
    history.forEach((item) => {
      if (item.pay_date && Number(item.cash_dividend) > 0) {
        const year = item.pay_date.split("-")[0];
        const amount = Number(item.cash_dividend);
        if (yearMap.has(year)) {
          yearMap.set(year, yearMap.get(year) + amount);
        } else {
          yearMap.set(year, amount);
        }
      }
    });

    return Array.from(yearMap.entries())
      .map(([date, total]) => ({
        date, // 這裡的 date 是 "2024"
        total: Number(total.toFixed(2)),
        label: `${date}年`
      }))
      .sort((a, b) => Number(a.date) - Number(b.date));
  }, [history]);

  // 3. 資料處理：明細模式 (由舊到新，不合併)
  const detailData = useMemo(() => {
    if (!history || history.length === 0) return [];

    return history
      .filter(item => item.pay_date && Number(item.cash_dividend) > 0)
      .map(item => ({
        date: item.pay_date, // 這裡的 date 是 "2024-05-20"
        total: Number(item.cash_dividend),
        label: item.pay_date
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // 日期遞增排序
  }, [history]);

  // 決定目前要渲染的資料
  const currentData = viewMode === "annual" ? annualData : detailData;

  if (currentData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        
        {/* 標題 */}
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">📊</span>
          歷年現金股利趨勢
        </h3>

        {/* 切換按鈕 (Tab Switcher) */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("annual")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              viewMode === "annual"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            年度
          </button>
          <button
            onClick={() => setViewMode("detail")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              viewMode === "detail"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            明細
          </button>
        </div>
      </div>
      
      {/* 圖表區域 */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
                // 如果是明細模式，資料點太多可能會擠在一起，這裡讓它自動隱藏部分標籤
                minTickGap={30} 
            />
            
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
            />
            
            <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                // 自訂 Tooltip 顯示格式
                formatter={(value) => [`$${value}`, "現金股利"]}
                labelFormatter={(label) => viewMode === 'annual' ? `${label}年度` : `發放日：${label}`}
            />
            
            <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={viewMode === 'annual' ? 30 : 15} animationDuration={500}>
              {currentData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    // 最新一筆資料用深藍色高亮顯示
                    fill={index === currentData.length - 1 ? '#3b82f6' : '#93c5fd'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-center text-xs text-slate-400 mt-4">
        {viewMode === "annual" 
            ? "* 年度模式顯示該年度累計發放總和 (含所有季配/月配)" 
            : "* 明細模式顯示每一次獨立的現金股利發放金額"}
      </p>
    </div>
  );
}