/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 👇 新增這一行
  output: 'standalone', 
  compress: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig