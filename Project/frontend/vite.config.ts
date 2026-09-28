import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
    hmr: {
      clientPort: 443,
    },
    watch: {
      usePolling: true,
      interval: 800,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5075',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
