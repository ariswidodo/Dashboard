import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Keep the cache path portable for Windows, Linux, GitHub Actions, and Cloudflare.
  cacheDir: '.vite-cache',
});
