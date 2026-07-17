/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-ocean': '#0A3D62',
        'clear-teal': '#00B894',
        'coral-orange': '#FF6B4A',
        'sea-foam': '#F0F7F4',
        'sandy-beige': '#F5E6D3',
        'dark-navy': '#1C2C3E',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'brand': '8px',
        'brand-lg': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(10, 61, 98, 0.1)',
        'card-hover': '0 4px 16px rgba(10, 61, 98, 0.2)',
      }
    },
  },
  plugins: [],
}