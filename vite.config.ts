import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

import { resolveScoringWorkerOrigin } from './src/lib/scoringWorkerEnv'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
        '/api/scoring': {
          target: resolveScoringWorkerOrigin({
            VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
            VITE_SCORING_WORKER_URL: env.VITE_SCORING_WORKER_URL,
            VITE_GRADING_WORKER_URL: env.VITE_GRADING_WORKER_URL,
            VITE_SCORING_WORKER_PORT: env.VITE_SCORING_WORKER_PORT,
          }),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/scoring/, '/auto-score'),
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
  }
})
