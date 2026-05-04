import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
    plugins: [
        vue(),
        createSvgIconsPlugin({
            iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
            symbolId: 'icon-[dir]-[name]',
            inject: 'body-last',
            customDomId: '__svg__icons__dom__',
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 5173,
        hmr: {
            overlay: true
        },
        fs: {
            strict: false
        },
        headers: {
            'Cache-Control': 'no-cache'
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            '/upload': {
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    },
    cacheDir: '.vite',
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
                // 添加文件名 hash，确保每次构建生成不同的文件名
                entryFileNames: 'js/[name].[hash].js',
                chunkFileNames: 'js/[name].[hash].js',
                assetFileNames: '[ext]/[name].[hash].[ext]'
            }
        }
    }
})


