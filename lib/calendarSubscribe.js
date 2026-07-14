export async function subscribeToCalendar(watchlist, addToast) {
  if (!Array.isArray(watchlist) || watchlist.length === 0) return;

  const url = `${window.location.origin}/api/proxy/api/calendar.ics?codes=${watchlist.join(",")}`;

  try {
    await navigator.clipboard.writeText(url);
    addToast(
      "已複製訂閱連結！到 Google/Apple 行事曆選「新增訂閱行事曆」貼上，除息與入帳日會自動同步",
      "success"
    );
  } catch (error) {
    window.open(url, "_blank", "noopener,noreferrer");
    addToast("無法複製連結，已改為開啟行事曆檔案", "info");
  }
}
