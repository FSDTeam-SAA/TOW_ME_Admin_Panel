import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://towmedn.com/admin/, so assets must resolve under that
// path rather than the domain root. Change to '/' if this ever moves to its
// own subdomain.
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
})
