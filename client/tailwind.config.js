/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00684A",
        accent: "#E65F41",
        bg: "#F9FBFA",
        textDark: "#1A1C1E",
      },
    },
  },
  plugins: [],
};
