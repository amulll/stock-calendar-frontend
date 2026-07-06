import useSWR from "swr";

// 個股詳情 (info / metrics / history)。code 為空時傳 null key，SWR 不會發送請求。
// StockModal 與 PortfolioModal 共用同一組快取，自動去重複。
export function useStockDetail(code) {
  const { data, error, isLoading } = useSWR(
    code ? `api/stock/${code}` : null
  );

  return {
    detail: data || null,
    error,
    isLoading,
  };
}
