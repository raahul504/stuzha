/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dcs-purple': '#9D50BB',
        'dcs-dark-purple': '#6E48AA',
        'dcs-electric-indigo': '#8E2DE2',
        'dcs-black': '#0A0A0A',
        'dcs-dark-gray': '#121212',
        'dcs-light-gray': '#1E1E1E',
        'dcs-text-gray': '#B0B0B0',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #9D50BB, #6E48AA)',
        'dark-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1a0a2e 100%)',
        'auth-gradient': 'linear-gradient(135deg, #1a0a2e 0%, #0A0A0A 100%)',
      },
      animation: {
        'float': 'float 6s infinite ease-in-out',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}