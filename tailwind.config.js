/** @type {import('tailwindcss').Config} */
export default {
  // 关键点：这里必须包含所有 .vue 和 .ts 文件路径
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
