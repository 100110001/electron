import { resolve } from 'path'
import {
  defineConfig,
  externalizeDepsPlugin,
  splitVendorChunkPlugin,
  bytecodePlugin
} from 'electron-vite'
// import { type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { visualizer } from 'rollup-plugin-visualizer'
import { vitePluginForArco } from '@arco-plugins/vite-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      vitePluginForArco({ style: 'css' }),
      splitVendorChunkPlugin()
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'visualizer.html'
      // }) as PluginOption
    ],
    server: {
      proxy: {
        '/restapi': {
          target: 'https://restapi.amap.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/restapi/, '')
        }
      }
    }
  }
})
