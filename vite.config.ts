import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/santiago-users': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/pedidos-ms': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/companies': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        secure: false
      },
      '/santiago-companies': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        secure: false
      },
      '/santiago-branches': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        secure: false
      },
      '/santiago-categories': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        secure: false
      },
      '/santiago-prod': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        secure: false
      },
      '/santiago-pricing': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        secure: false
      },
      '/santiago-catprod': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
