import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: [
      '@antv/f6',
      '@antv/f6-ui',
      '@antv/g-mobile',
      '@antv/f6-hammerjs'
    ]
  },
  resolve: {
    alias: [
      {
        find: '@antv/f6-hammerjs',
        replacement: path.resolve(__dirname, 'node_modules/@antv/f6-hammerjs/dist/esm/index.es.js')
      }
    ]
  }
})
