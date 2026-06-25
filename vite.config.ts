import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/tainui_isomap/',
  plugins: [react(), tailwindcss()],
  preview: {
    allowedHosts: true,
  },
})
