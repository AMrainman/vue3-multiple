import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import { viteVConsole } from 'vite-plugin-vconsole'
import { input } from './input'
import UnoCSS from 'unocss/vite'

const isReport = process.env.REPORT === 'true'
export const getPlugins = (mode: any) => {
  return [
    vue(),
    vueJsx(),
    UnoCSS(),
    isReport
      ? visualizer({
          filename: './node_modules/.cache/visualizer/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      : [],
    visualizer(),
    AutoImport({
      imports: ['vue']
    }),
    Components({
      resolvers: []
    }),
    Components(),
    viteCompression({
      ext: '.gz',
      algorithm: 'gzip',
      deleteOriginFile: false
    }),
    viteVConsole({
      entry: input,
      localEnabled: mode !== 'production',
      enabled: mode !== 'production',
      config: {
        maxLogNumber: 1000,
        theme: 'dark'
      }
    })
  ]
}
