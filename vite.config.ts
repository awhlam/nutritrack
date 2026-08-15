import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Served from https://<user>.github.io/nutritrack/ on GitHub Pages. Hosts that
// serve from the domain root (Netlify, Vercel, Cloudflare Pages) need
// BASE_PATH=/ at build time.
const base = process.env.BASE_PATH ?? '/nutritrack/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      workbox: {
        // clientsClaim lets a newly-activated worker take control of the
        // page that's already open (not just future navigations) — without
        // it, the "controlling" event our Refresh button waits on never
        // fires, and the reload silently never happens.
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'NutriTrack',
        short_name: 'NutriTrack',
        description: 'Track carbs and nutrition consumed during runs and rides.',
        theme_color: '#0b0f14',
        background_color: '#0b0f14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
