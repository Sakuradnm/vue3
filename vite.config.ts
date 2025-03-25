import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

import path from "path";


// 使用 defineConfig 定义 Vite 配置
export default defineConfig({
  plugins: [
      vue()
      // 引入svg插件
      ,createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
  ],
  resolve: {
      alias: {
          '@': path.resolve(__dirname, './src'),

      }
  },
    assetsInclude: ['**/*.woff2']
})


