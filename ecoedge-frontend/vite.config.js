import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'EcoEdge SCADA Operator',
        short_name: 'EcoEdge',
        description: 'Microgrid monitoring for community operators.',
        theme_color: '#0d1115', // Your dark theme background
        background_color: '#0d1115',
        display: 'standalone', // This hides the browser URL bar!
        icons: [
          {
            src: 'pwa-192x192.png', // Add a 192x192 logo to your /public folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Add a 512x512 logo to your /public folder
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // Increased limit to 4MB
      }
    })
  ]
})