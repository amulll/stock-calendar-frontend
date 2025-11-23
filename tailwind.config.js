/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // 明亮藍
        secondary: "#10B981", // 薄荷綠
        background: "#F8FAFC", // 很淺的灰白背景
      }
    },
  },
  plugins: [],
}
