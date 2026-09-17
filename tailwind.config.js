/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        'xs': ['15px', { lineHeight: '21px' }],
        'sm': ['16px', { lineHeight: '22px' }],
        'base': ['17px', { lineHeight: '25px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['23px', { lineHeight: '31px' }],
        '2xl': ['27px', { lineHeight: '35px' }],
        '3xl': ['33px', { lineHeight: '40px' }],
      },
      fontFamily: {
        mulish: ['Mulish', 'sans-serif'],
      },
      screens: {
        tablet: '768px',
        laptop: '1024px',
        desktop: '1440px',
        wide: '1920px',
      },
      colors: {
        // ICICI Lombard Brand Colors
        icici: {
          maroon: '#B02A30',
          'maroon-dark': '#8B1A1F',
          'maroon-light': '#D4464C',
          orange: '#F99D27',
          'orange-light': '#FBBD6A',
          'orange-dark': '#E07D0E',
          navy: '#005B75',
          'navy-light': '#007A9E',
          'navy-dark': '#003D50',
          cream: '#FFF8F0',
          'warm-gray': '#F5F0EB',
        },
        fossil: {
          coal: '#B02A30',
          lignite: '#D4464C',
          gas: '#F99D27',
          diesel: '#FBBD6A',
        },
        nonfossil: {
          solar: '#F99D27',
          wind: '#005B75',
          small_hydro: '#007A9E',
          large_hydro: '#003D50',
          biomass: '#4CAF50',
          nuclear: '#7B1FA2',
        },
      },
      boxShadow: {
        'icici': '0 2px 8px rgba(176, 42, 48, 0.08)',
        'icici-lg': '0 4px 16px rgba(176, 42, 48, 0.12)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-8px)' },
          '30%': { transform: 'translateX(8px)' },
          '45%': { transform: 'translateX(-6px)' },
          '60%': { transform: 'translateX(6px)' },
          '75%': { transform: 'translateX(-3px)' },
          '90%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        fall: 'fall 1.5s ease-in forwards',
        shake: 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};
