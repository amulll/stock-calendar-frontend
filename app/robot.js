// app/robots.js

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/',            // 阻擋 private 資料夾
        '/*?*openModal=true',   // 阻擋彈跳視窗參數
        '/*?*date=',            // 🔥 新增：阻擋日期查詢參數
      ],
    },
    sitemap: 'https://ugoodly.com/sitemap.xml',
  }
}