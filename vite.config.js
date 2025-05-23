import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~bootstrap': 'bootstrap'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "bootstrap/scss/_functions.scss";
          @import "bootstrap/scss/_variables.scss";
          @import "bootstrap/scss/_mixins.scss";
        `
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'esnext',
    minify: 'esbuild'
  }
})