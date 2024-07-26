import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import { viteVConsole } from 'vite-plugin-vconsole'
import { mainEntry } from './entry'
import UnoCSS from 'unocss/vite'

export const getPlugins = (mode: string) => {
  const isReport = process.argv.includes('--report')
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
    viteCompression({
      ext: '.gz',
      algorithm: 'gzip',
      deleteOriginFile: false
    }),
    viteVConsole({
      entry: mainEntry,
      localEnabled: !['production', 'development'].includes(mode),
      enabled: !['production', 'development'].includes(mode),
      config: {
        maxLogNumber: 1000,
        theme: 'dark'
      }
    })
  ]
}
