/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic':
            'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
      },
      fontSize: {
        '5xs': "0.35rem",
        '4xs': "0.5rem",
        '3xs': "0.65rem",
        '2xs': "0.75rem",
        'xs': '0.8rem',
        'sm': '0.9rem',
        'base': '1rem',
        'lg': '1.1rem',
        'xl': '1.25rem',
        '2xl': '1.563rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      },
    },
    plugins: [],
};
