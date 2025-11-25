# 1. 安裝依賴階段
FROM node:18-alpine AS deps
WORKDIR /app
# 複製 package 設定檔
COPY package.json package-lock.json* yarn.lock* ./
# 安裝套件 (根據鎖定檔選擇安裝方式)
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# 2. 建置階段
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 設定環境變數 (略過 eslint 檢查以加速建置)
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 開始建置
RUN npm run build

# 3. 執行階段
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 建立非 root 使用者以提升安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製建置產物 (Standalone 模式)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]