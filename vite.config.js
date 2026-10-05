import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — сборку можно положить в любую папку (GitHub Pages, Netlify, Vercel)
export default defineConfig({
  plugins: [react()],
  base: './',
})
