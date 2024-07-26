import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import { input } from './build/entry'
import { getPlugins } from './build/plugins'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log('argv::', process.argv)
  const plugins = getPlugins(mode)

  return {
    base: '/',
    root: resolve(__dirname, 'src/pages'),
    publicDir: resolve(__dirname, 'public'),
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      assetsDir: 'static', // 静态文件目录
      // 默认情况下 若 outDir 在 root 目录下， 则 Vite 会在构建时清空该目录。
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      cssCodeSplit: true, // 默认true。如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
      rollupOptions: {
        input,
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          // manualChunks: {
          //   vandor: ['vue', 'vue-i18n', 'axios'],
          //   vant: ['vant']
          // },
          manualChunks(id) {
            // 单独打包第三方依赖
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      }
    }
  }
})
