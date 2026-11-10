import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // The browser (including iPhone Safari) calls /api on this same origin.
    // Vite forwards those requests to the Node API, so localhost on the phone
    // never accidentally points to the phone itself.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
});
