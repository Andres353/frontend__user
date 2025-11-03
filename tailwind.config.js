/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#f97316',
          blue: '#3b82f6',
        },
        secondary: {
          gray: '#6b7280',
        },
        background: '#f9fafb',
        surface: '#ffffff',
        text: {
          primary: '#111827',
          secondary: '#6b7280',
        },
        border: '#e5e7eb',
        success: '#f97316',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
