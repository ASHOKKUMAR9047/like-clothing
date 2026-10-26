/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF5500",      // Exact vibrant orange from LIKE logo
          orangeHover: "#E64A00",
          orangeLight: "#FFF3ED",
          dark: "#111111",         // Jet black from LIKE logo
          charcoal: "#1F2428",
          muted: "#6B7280",
          border: "#E5E7EB",
          surface: "#F9FAFB",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Montserrat"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(255, 85, 0, 0.18)',
        'elevated': '0 12px 30px -4px rgba(17, 17, 17, 0.12)',
      }
    },
  },
  plugins: [],
}
