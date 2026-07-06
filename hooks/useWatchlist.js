"use client";

import { useEffect, useMemo, useState } from "react";

function loadJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse ${key}`, err);
    return fallback;
  }
}

// 集中管理自選股、持有股數、成本價，全部以 localStorage 持久化 (僅此裝置)
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [sharesMap, setSharesMap] = useState({});
  const [costMap, setCostMap] = useState({});

  useEffect(() => {
    setWatchlist(loadJson("myWatchlist", []));
    setSharesMap(loadJson("mySharesMap", {}));
    setCostMap(loadJson("myCostMap", {}));
  }, []);

  const toggleWatchlist = (code) => {
    setWatchlist((prev) => {
      const updated = prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code];
      localStorage.setItem("myWatchlist", JSON.stringify(updated));
      return updated;
    });
  };

  const updateShares = (code, shares) => {
    setSharesMap((prev) => {
      const updated = { ...prev, [code]: shares };
      localStorage.setItem("mySharesMap", JSON.stringify(updated));
      return updated;
    });
  };

  const updateCost = (code, price) => {
    setCostMap((prev) => {
      const updated = { ...prev };
      // 空值 = 清除自訂成本，退回帶入現價
      if (price === "" || price === null || price === undefined) {
        delete updated[code];
      } else {
        updated[code] = price;
      }
      localStorage.setItem("myCostMap", JSON.stringify(updated));
      return updated;
    });
  };

  const watchlistSet = useMemo(() => new Set(watchlist), [watchlist]);

  return {
    watchlist,
    sharesMap,
    costMap,
    watchlistSet,
    toggleWatchlist,
    updateShares,
    updateCost,
  };
}
