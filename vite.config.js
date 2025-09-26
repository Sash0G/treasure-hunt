import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// replace `treasure-hunt` with your repo name
export default defineConfig({
  plugins: [react()],
  base: "/treasure-hunt/",
});
