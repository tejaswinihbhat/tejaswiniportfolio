import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { ink: "#10243A", gold: "#B9975B", paper: "#F7F8FA" }, boxShadow: { soft: "0 12px 40px rgba(16,36,58,.08)" } } },
  plugins: []
};
export default config;
