// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default { // <--- Changed from module.exports to export default
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bhuBlue: '#1E3A8A', 
        bhuOrange: '#FF6F00',
        bhuGrey: '#6D6E70'
      },
      screens: {
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '3xl': '1920px',
      },
      animation: {
        'fade-in': 'fadeIn 10s linear infinite',
        'marquee': "marquee 10s linear infinite",
        'marquee-reverse': "marquee-reverse 10s linear infinite", 
      },
      keyframes: {
        fadeIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee: { 
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marqueeReverse: { 
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      }
    },
  },
  plugins: [],
};