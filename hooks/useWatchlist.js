"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  watchlist: "myWatchlist",
  sharesMap: "mySharesMap",
  costMap: "myCostMap",
};

function loadJson(storage, key, fallback) {
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse ${key}`, err);
    return fallback;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateBackup(data) {
  if (!isPlainObject(data) || data.v !== 1) {
    throw new Error("不支援的備份版本");
  }
  if (
    !Array.isArray(data.watchlist) ||
    !data.watchlist.every((code) => typeof code === "string" && code.length > 0)
  ) {
    throw new Error("自選股清單格式錯誤");
  }
  if (!isPlainObject(data.sharesMap) || !isPlainObject(data.costMap)) {
    throw new Error("持股或成本資料格式錯誤");
  }

  const sharesAreValid = Object.values(data.sharesMap).every(
    (value) => typeof value === "number" && Number.isFinite(value) && value >= 0
  );
  const costsAreValid = Object.values(data.costMap).every((value) => {
    if (typeof value !== "string" && typeof value !== "number") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0;
  });
  if (!sharesAreValid || !costsAreValid) {
    throw new Error("持股或成本數值格式錯誤");
  }

  return {
    watchlist: [...data.watchlist],
    sharesMap: { ...data.sharesMap },
    costMap: { ...data.costMap },
  };
}

// 集中管理自選股、持有股數、成本價，全部以 localStorage 持久化 (僅此裝置)
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [sharesMap, setSharesMap] = useState({});
  const [costMap, setCostMap] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const storage = window.localStorage;
      setWatchlist(loadJson(storage, STORAGE_KEYS.watchlist, []));
      setSharesMap(loadJson(storage, STORAGE_KEYS.sharesMap, {}));
      setCostMap(loadJson(storage, STORAGE_KEYS.costMap, {}));
      setStorageAvailable(true);
    } catch (error) {
      console.error("Browser storage is unavailable", error);
      setStorageAvailable(false);
    } finally {
      setHydrated(true);
    }
  }, []);

  const persist = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStorageAvailable(true);
      return true;
    } catch (error) {
      console.error(`Failed to persist ${key}`, error);
      setStorageAvailable(false);
      return false;
    }
  };

  const toggleWatchlist = (code) => {
    setWatchlist((prev) => {
      const updated = prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code];
      persist(STORAGE_KEYS.watchlist, updated);
      return updated;
    });
  };

  const updateShares = (code, shares) => {
    setSharesMap((prev) => {
      const updated = { ...prev, [code]: shares };
      persist(STORAGE_KEYS.sharesMap, updated);
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
      persist(STORAGE_KEYS.costMap, updated);
      return updated;
    });
  };

  const exportData = () =>
    JSON.stringify(
      {
        v: 1,
        watchlist,
        sharesMap,
        costMap,
      },
      null,
      2
    );

  const importData = (str) => {
    let backup;
    try {
      backup = validateBackup(JSON.parse(str));
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "備份格式錯誤",
      };
    }

    let previousValues = null;

    try {
      previousValues = Object.fromEntries(
        Object.entries(STORAGE_KEYS).map(([name, key]) => [
          name,
          window.localStorage.getItem(key),
        ])
      );
      window.localStorage.setItem(
        STORAGE_KEYS.watchlist,
        JSON.stringify(backup.watchlist)
      );
      window.localStorage.setItem(
        STORAGE_KEYS.sharesMap,
        JSON.stringify(backup.sharesMap)
      );
      window.localStorage.setItem(STORAGE_KEYS.costMap, JSON.stringify(backup.costMap));
    } catch (error) {
      setStorageAvailable(false);
      if (previousValues) {
        try {
          Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            const previousValue = previousValues[name];
            if (previousValue === null) window.localStorage.removeItem(key);
            else window.localStorage.setItem(key, previousValue);
          });
        } catch (rollbackError) {
          console.error("Failed to roll back watchlist import", rollbackError);
        }
      }
      return { ok: false, error: "無法寫入瀏覽器儲存空間" };
    }

    setWatchlist(backup.watchlist);
    setSharesMap(backup.sharesMap);
    setCostMap(backup.costMap);
    setStorageAvailable(true);
    return { ok: true };
  };

  const watchlistSet = useMemo(() => new Set(watchlist), [watchlist]);

  return {
    watchlist,
    sharesMap,
    costMap,
    watchlistSet,
    hydrated,
    storageAvailable,
    toggleWatchlist,
    updateShares,
    updateCost,
    exportData,
    importData,
  };
}
