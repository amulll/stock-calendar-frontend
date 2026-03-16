# DEVELOPMENT_LOG

## ✅ 已完成功能 (Completed)

- [x] 已完成 App Router 架構設置。
- [x] 已完成 SSR 初始資料抓取。
- [x] 已建立基本 UI 視覺風格與主要頁面版型。

## 🚨 急需修正 (High Priority)

- [x] XSS 安全漏洞修復 (`dangerouslySetInnerHTML`)。
- [x] 統一 API Proxy 存取路徑（修正 `YieldListModal`）。
- [ ] 修正除息日連結錯誤。

## 🔧 架構優化與效能 (Medium Priority)

- [ ] 重構 `CalendarClient`（元件拆解與 Hook 提取）。
- [ ] 使用 `useMemo` 進行資料分組，優化 render 效能。
- [ ] 改用 `router.replace` 維護乾淨的瀏覽器 history。

## 🎨 UX & Accessibility (Low Priority)

- [ ] 實作 Modal 可及性（Focus trap、ARIA labels）。
- [ ] 建立全域錯誤提示 UI。

## 📝 備註

- 已新增 `lib/proxy-client.js`，統一 Client 端透過 `/api/proxy` 存取後端。
- 已於 `app/api/proxy/[...path]/route.js` 加入 `ALLOWED_PREFIXES` 白名單檢查，避免 proxy 被任意濫用。
- 目前專案缺乏 lockfile，且本地未見 `node_modules`，不利於依賴版本穩定與重現環境。
- 建議後續補上 lockfile（如 `package-lock.json` 或 `yarn.lock`），以強化版本控制與部署一致性。
