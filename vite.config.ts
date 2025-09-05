import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Expor variáveis de ambiente para o cliente (apenas em desenvolvimento)
    ...(process.env.NODE_ENV === 'development' && {
      'import.meta.env.VITE_BITRIX_WEBHOOK_URL': JSON.stringify(process.env.BITRIX_WEBHOOK_URL)
    })
  },
  server: {
    port: 3000,
    host: true
  }
})
