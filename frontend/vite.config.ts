import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            if (id.includes('quill') || id.includes('react-quill')) {
              return 'editor';
            }
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'utils';
            }
            return 'vendor';
          }
          if (id.includes('tiktok') || id.includes('TikTok')) {
            return 'tiktok';
          }
        }
      }
    },
    cssCodeSplit: true,
    cssMinify: true,
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      'naramakna.id',
      'naramakna.id',
      '.naramakna.id'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // For dev mode only
        changeOrigin: true,
      },
    },
  },
}))
