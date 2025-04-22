/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'print:block',
    'print:hidden',
    'print:border',
    'print:border-gray-300',
    'page-break-after',
    'page-break-before',
    'page-break-avoid',
    'simulate-pdf-view'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#1e293b',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 