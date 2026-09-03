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
        fontFamily: {
          sans: ['Rubik', 'system-ui', 'sans-serif'],
        },
        // Shared with the customer-facing site's brand (front/) - the admin
        // panel had no palette of its own before this, just Tailwind's
        // defaults sprinkled inconsistently across screens.
        colors: {
          brand: {
            DEFAULT: '#2D7DD2',
            dark: '#1f63ab',
            tint: '#e8f1fb',
            border: '#cfe0f5',
          },
          ink: '#1c2733',
          muted: '#526070',
          'muted-2': '#94a3b0',
          soon: '#8b7cf6',
          'soon-tint': '#f2f0fd',
          status: {
            notdone: '#e0483a',
            preparing: '#f2994a',
            'preparing-tint': 'rgba(242,153,74,.12)',
            courier: '#2D7DD2',
            done: '#1a9e6b',
            canceled: '#8a94a0',
          },
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
