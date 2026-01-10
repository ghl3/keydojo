import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FEF2F2",
          100: "#FDE8E8",
          200: "#FBD5D5",
          300: "#F8B4B4",
          400: "#F98080",
          500: "#C94A4A",
          600: "#B43737",
          700: "#9B2C2C",
          800: "#822727",
          900: "#6B2020",
          950: "#450A0A",
        },
        cream: {
          50: "#FFFBF7",
          100: "#FFF7ED",
          200: "#FEF3E2",
          300: "#FDECD3",
          400: "#F9DFC0",
          500: "#F5D0A9",
          600: "#E6B980",
          700: "#D4A574",
          800: "#B8906A",
          900: "#8B7355",
          950: "#5C4D3D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        key: "0 2px 0 0 rgba(0, 0, 0, 0.1)",
        "key-pressed": "0 0 0 0 rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        "cursor-underline-blink": {
          "0%, 50%": { borderBottomColor: "rgb(201, 74, 74)" }, // primary-500
          "51%, 100%": { borderBottomColor: "transparent" },
        },
        "key-press": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(2px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "cursor-blink": "cursor-underline-blink 1s infinite",
        "key-press": "key-press 100ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
