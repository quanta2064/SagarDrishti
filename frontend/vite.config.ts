import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['nonprescriptive-unbrokenly-anette.ngrok-free.dev'],
  },
})