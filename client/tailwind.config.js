/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",  // Scans your React files (JS only, since no TS)
  ],
  theme: {
    extend: {
      colors: {
        // Professional Blue Palette (from my earlier suggestion—pick one!)
        primary: {
          500: '#3B82F6',  // Main blue
          700: '#1D4ED8',  // Darker hover
        },
        secondary: { 500: '#10B981' },  // Green for success
        accent: { 500: '#F59E0B' },    // Amber for warnings
        neutral: {
          50: '#F9FAFB',   // Light bg
          800: '#1F2937',  // Dark text
        },
      },
        animation: {
        blob: 'blob 7s infinite',
        gradientx: 'gradient-x 8s ease infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};













































