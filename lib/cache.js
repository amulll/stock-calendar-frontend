const CACHE_TTL_MS = 5 * 60 * 1000;

const dividendCache = new Map();
const stockLatestCache = new Map();

function getEntry(map, key) {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    map.delete(key);
    return null;
  }
  return entry.data;
}

function setEntry(map, key, data) {
  map.set(key, { data, timestamp: Date.now() });
}

export function getCachedDividends(key) {
  return getEntry(dividendCache, key);
}

export function setCachedDividends(key, data) {
  setEntry(dividendCache, key, data);
}

export function getCachedStockLatest(key) {
  return getEntry(stockLatestCache, key);
}

export function setCachedStockLatest(key, data) {
  setEntry(stockLatestCache, key, data);
}
