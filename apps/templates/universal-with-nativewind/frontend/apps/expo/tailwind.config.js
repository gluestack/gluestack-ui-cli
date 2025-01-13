// tailwind.config.js
const tailwindConfig = require('@app-launch-kit/components/tailwind.config.js');


module.exports = {
  ...tailwindConfig,
  darkMode: process.env.DARK_MODE ? process.env.DARK_MODE : 'media',
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{html,js,ts,jsx,tsx,mdx}',
    '../../packages/components/**/**/*.{html,js,jsx,ts,tsx}',
    '../../packages/modules/**/**/*.{html,js,jsx,ts,tsx}',
    './stories/**/*.{html,js,jsx,ts,tsx,mdx}',
    './stories/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx}',
    './assets/**/*.{html,js,jsx,ts,tsx,svg}',
  ],
  presets: [require('nativewind/preset')],
  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|toast|light|dark)/,
    },
  ],
};
