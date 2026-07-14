// 「我的存股成績單」分享卡片：以 Canvas 繪製 1080x1350 (IG 4:5) PNG。
// 設計原則：單一色相 (emerald) 長條圖、文字一律用 slate 墨色、
// 只對最大月份做直接標註、基線與框線保持低調。

import QRCode from "qrcode";

const W = 1080;
const H = 1350;
const SHARE_URL = "https://ugoodly.com/?utm_source=sharecard";

const COLORS = {
  backdrop: "#ecfdf5", // emerald-50
  card: "#ffffff",
  border: "#e2e8f0", // slate-200
  ink: "#020617", // slate-950
  inkSecondary: "#64748b", // slate-500
  inkMuted: "#94a3b8", // slate-400
  bar: "#10b981", // emerald-500
  barZero: "#e2e8f0", // slate-200
  hero: "#047857", // emerald-700
  heroBg: "#ecfdf5", // emerald-50
  heroBorder: "#a7f3d0", // emerald-200
  yield: "#d97706", // amber-600
  baseline: "#cbd5e1", // slate-300
};

const FONT = "system-ui, -apple-system, 'Segoe UI', 'Noto Sans TC', sans-serif";

function font(weight, size) {
  return `${weight} ${size}px ${FONT}`;
}

function money(value) {
  return "$" + Math.round(Number(value) || 0).toLocaleString("en-US");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("QR code 圖片載入失敗"));
    image.src = src;
  });
}

async function createQrImage() {
  const dataUrl = await QRCode.toDataURL(SHARE_URL, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 144,
    color: {
      dark: COLORS.ink,
      light: COLORS.card,
    },
  });
  return loadImage(dataUrl);
}

// ctx.roundRect 在舊瀏覽器不存在，自己畫
function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// 長條：只有頂端圓角 (資料端)，底端貼齊基線
function barPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function drawMonthlyChart(ctx, monthly, x, y, width, height) {
  const maxValue = Math.max(...monthly, 0);
  const labelSpace = 44; // 月份標籤列
  const valueSpace = 56; // 最大值直接標註的空間
  const plotH = height - labelSpace - valueSpace;
  const baselineY = y + valueSpace + plotH;

  // 基線 (低調)
  ctx.strokeStyle = COLORS.baseline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, baselineY);
  ctx.lineTo(x + width, baselineY);
  ctx.stroke();

  const slot = width / 12;
  const barW = slot * 0.56;
  const maxIndex = monthly.indexOf(maxValue);

  for (let i = 0; i < 12; i++) {
    const value = monthly[i];
    const bx = x + slot * i + (slot - barW) / 2;

    if (value > 0 && maxValue > 0) {
      const bh = Math.max((value / maxValue) * plotH, 10);
      ctx.fillStyle = COLORS.bar;
      barPath(ctx, bx, baselineY - bh, barW, bh, 8);
      ctx.fill();

      // 只對最大月份直接標註數值
      if (i === maxIndex) {
        ctx.fillStyle = COLORS.ink;
        ctx.font = font(700, 30);
        ctx.textAlign = "center";
        ctx.fillText(money(value), bx + barW / 2, baselineY - bh - 16);
      }
    } else {
      // 零值月份：貼基線的淺色殘根
      ctx.fillStyle = COLORS.barZero;
      barPath(ctx, bx, baselineY - 6, barW, 6, 3);
      ctx.fill();
    }

    // 月份標籤
    ctx.fillStyle = i === maxIndex && value > 0 ? COLORS.ink : COLORS.inkSecondary;
    ctx.font = font(i === maxIndex && value > 0 ? 700 : 400, 28);
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), x + slot * i + slot / 2, baselineY + 38);
  }
}

/**
 * 繪製分享卡片。
 * data: { year, income, yieldRate, stockCount, monthly: number[12] }
 * qrImage: 預先完成載入的 QR code Image，避免 Canvas 匯出時漏畫。
 */
export function renderShareCard(canvas, data, qrImage) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // 背景
  ctx.fillStyle = COLORS.backdrop;
  ctx.fillRect(0, 0, W, H);

  // 白色主卡
  const cardX = 48;
  const cardY = 48;
  const cardW = W - 96;
  const cardH = H - 96;
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fillStyle = COLORS.card;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = 72;
  const left = cardX + pad;
  const right = cardX + cardW - pad;
  let cursorY = cardY + pad + 20;

  // 品牌列
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.hero;
  ctx.font = font(900, 44);
  ctx.fillText("uGoodly", left, cursorY);
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.inkMuted;
  ctx.font = font(400, 30);
  ctx.fillText(`${data.year} 年度試算`, right, cursorY);

  // 標題
  cursorY += 96;
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(900, 64);
  ctx.fillText("我的存股成績單", left, cursorY);

  // 主數字區塊 (hero)
  cursorY += 56;
  const heroH = 220;
  roundRectPath(ctx, left, cursorY, right - left, heroH, 24);
  ctx.fillStyle = COLORS.heroBg;
  ctx.fill();
  ctx.strokeStyle = COLORS.heroBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = COLORS.hero;
  ctx.font = font(700, 32);
  ctx.fillText("預估年領股息", left + 44, cursorY + 66);
  ctx.font = font(900, 96);
  ctx.fillText(money(data.income), left + 44, cursorY + 172);

  // 次要指標列
  cursorY += heroH + 84;
  const colW = (right - left) / 2;

  ctx.fillStyle = COLORS.inkSecondary;
  ctx.font = font(400, 30);
  ctx.fillText("加權平均殖利率", left, cursorY);
  ctx.fillText("持股檔數", left + colW, cursorY);

  ctx.font = font(900, 56);
  ctx.fillStyle = COLORS.yield;
  ctx.fillText(`${(Number(data.yieldRate) || 0).toFixed(2)}%`, left, cursorY + 66);
  ctx.fillStyle = COLORS.ink;
  ctx.fillText(`${data.stockCount} 檔`, left + colW, cursorY + 66);

  // 每月現金流圖
  cursorY += 150;
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(700, 34);
  ctx.fillText("每月現金流", left, cursorY);

  cursorY += 24;
  drawMonthlyChart(ctx, data.monthly, left, cursorY, right - left, 280);

  // 頁尾
  const qrSize = 144;
  const qrY = cardY + cardH - pad - qrSize;
  ctx.drawImage(qrImage, left, qrY, qrSize, qrSize);

  ctx.fillStyle = COLORS.ink;
  ctx.font = font(700, 32);
  ctx.textAlign = "left";
  ctx.fillText("ugoodly.com", left + qrSize + 24, qrY + 52);
  ctx.fillStyle = COLORS.inkMuted;
  ctx.font = font(400, 24);
  ctx.fillText("掃碼查看台股股利日曆", left + qrSize + 24, qrY + 94);

  ctx.fillStyle = COLORS.inkMuted;
  ctx.font = font(400, 26);
  ctx.textAlign = "right";
  ctx.fillText("台股股利日曆 · 試算僅供參考", right, qrY + qrSize - 2);
}

/**
 * 產生卡片並分享：行動裝置優先走系統分享面板，否則下載 PNG。
 * 回傳 "shared" | "downloaded"。
 */
export async function shareCard(data) {
  const canvas = document.createElement("canvas");
  const qrImage = await createQrImage();
  renderShareCard(canvas, data, qrImage);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("圖片產生失敗");

  const file = new File([blob], `ugoodly-${data.year}.png`, {
    type: "image/png",
  });

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "我的存股成績單",
        text: `我在 uGoodly 試算 ${data.year} 年預估可領 ${money(data.income)} 股息！`,
      });
      return "shared";
    } catch (err) {
      // 使用者取消分享面板不算錯誤，也不需要退回下載
      if (err && err.name === "AbortError") return "shared";
      // 其他失敗 (權限等) 退回下載
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ugoodly-${data.year}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return "downloaded";
}
