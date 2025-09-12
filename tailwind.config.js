import lineClamp from "@tailwindcss/line-clamp";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: "#4f46e5",
          purple: "#7c3aed",
          green: "#10b981",
          red: "#ef4444",
          surface: "#0f172a"
        }
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.08)",
        cardHover: "0 20px 50px rgba(0,0,0,0.14)"
      },
      borderRadius: {
        xl2: "20px",
        xl3: "25px"
      }
    }
  },
  plugins: [lineClamp]
};
