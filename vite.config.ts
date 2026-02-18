import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/quotes': {
        target: 'https://type.fit',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Ensure all image formats are processed
  assetsInclude: ['**/*.jpeg', '**/*.jpg', '**/*.png', '**/*.gif', '**/*.webp'],
  build: {
    // Optimize asset handling
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  // If deploying to subdirectory, uncomment and set:
  // base: process.env.BASE_URL || '/',
})
