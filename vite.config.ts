import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { Plugin as importToCDN } from 'vite-plugin-cdn-import';
import externalGlobals from 'rollup-plugin-external-globals';
import path from 'path';

const { NODE_ENV, ...other } = process.env;

const externalGlobalsObj = {
    vue: 'Vue',
    'vue-demi': 'VueDemi',
    'element-plus': 'ElementPlus'
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            script: {
                defineModel: true
            }
        }),
        createStyleImportPlugin({
            resolves: [VxeTableResolve()]
        }),
        Unocss(),
        importToCDN({
            modules: [
                // Vue
                {
                    name: 'vue',
                    var: 'Vue',
                    path: `https://cdn.staticfile.org/vue/3.3.4/vue.global.prod.min.js`,
                    css: [
                        // Normalize 样式重置
                        'https://cdn.staticfile.org/normalize/8.0.1/normalize.min.css'
                    ]
                },
                {
                    name: 'vue-demi',
                    var: 'VueDemi',
                    path: 'https://registry.npmmirror.com/vue-demi/0.14.6/files/lib/index.iife.js'
                },

                // ElementPlus组件库
                {
                    name: 'element-plus',
                    var: 'ElementPlus',
                    path: 'https://cdn.staticfile.org/element-plus/2.3.14/index.full.min.js',
                    css: [
                        'https://cdn.staticfile.org/element-plus/2.3.14/index.css',
                        'https://registry.npmmirror.com/element-plus/2.3.14/files/theme-chalk/dark/css-vars.css'
                    ]
                },
                {
                    name: 'element-plus/dist/locale/zh-cn.min.mjs',
                    var: 'ElementPlusLocaleZhCn',
                    path: 'https://cdn.staticfile.org/element-plus/2.3.14/locale/zh-cn.min.js'
                }
            ]
        }),
        AutoImport({
            imports: ['vue'],
            dirs: ['./src/api', './src/store', './src/utils'],
            dts: './src/declare/auto-import.d.ts'
        }),
        {
            ...externalGlobals(externalGlobalsObj),
            enforce: 'post',
            apply: 'build'
        }
    ],
    resolve: {
        alias: {
            '@': path.resolve('./src')
        }
    },
    base: './',
    build: {
        outDir: './server'
    },
    define: {
        'process.env': { VUE_APP_ENV: NODE_ENV }
    },
    server: {
        proxy: {
            '/mossm': {
                target: 'https://mossm.mobingc.cn',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});
