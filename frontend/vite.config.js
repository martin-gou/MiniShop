import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["localhost","distensible-demi-nonpermitted.ngrok-free.dev","host1.ngrok-free.dev", "host2.ngrok-free.dev"],
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false,
      },
    }
  },
});
