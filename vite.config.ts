import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";
import { createRequire } from 'module';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
createRequire(import.meta.url);
// 使用 defineConfig 定义 Vite 配置
export default defineConfig({
  plugins: [
      vue(),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // 指定 symbolId 格式
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


