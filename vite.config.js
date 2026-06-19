import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // accesible desde la red local (útil en WSL2)
    port: 5173,
    // En dev, el frontend (5173) proxya las llamadas /api al backend Node (8080)
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
