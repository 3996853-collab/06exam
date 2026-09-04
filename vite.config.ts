import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // Only use singlefile plugin when building for single-file output
    ...(mode === 'singlefile' ? [viteSingleFile()] : [])
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    // When in singlefile mode, inline all assets
    ...(mode === 'singlefile' ? {
      outDir: 'dist-single',
      assetsInlineLimit: 100000000,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    } : {})
  }
}))
