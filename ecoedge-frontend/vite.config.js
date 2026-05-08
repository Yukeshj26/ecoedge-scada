import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 1. We are commenting out the PWA plugin
// import { VitePWA } from 'vite-plugin-pwa' 

export default defineConfig({
  plugins: [
    react(),
    // 2. We are removing the VitePWA block entirely for now
  ],
  // 3. Keep the code splitting, using a simpler, forced syntax
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
          firebase: ['firebase']
        }
      }
    }
  }
})