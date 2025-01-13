/** @type {import('tailwindcss').Config} */
const tailwindConfig = require('@app-launch-kit/components/tailwind.config.js');
module.exports = {
  ...tailwindConfig,
  darkMode: 'class',
  important: 'html',
  content: [
    '../../packages/components/**/**/*.{html,js,jsx,ts,tsx,mdx}',
    '../../packages/modules/**/**/*.{html,js,jsx,ts,tsx,mdx}',
    './app/**/*.{html,js,jsx,ts,tsx}',
    './stories/**/*.{html,js,jsx,ts,tsx,mdx}',
    './stories/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  plugins: [require('@unitools/font-plugin/next')],
};
