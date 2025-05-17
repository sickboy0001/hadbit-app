// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // src 以下のすべての関連ファイルを対象にする
    // "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ...テーマの拡張
    },
  },
  corePlugins: {
    preflight: false, // Preflight (base styles) を無効にする
  },
  // ...他の設定
  plugins: [
    require('@tailwindcss/typography'),
    // ...他のプラグイン
  ],
}
