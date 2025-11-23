/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 避免在 Zeabur 上建置時因為 eslint 報錯而失敗
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
