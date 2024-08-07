import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { Plugin as importToCDN } from 'vite-plugin-cdn-import';
import externalGlobals from 'rollup-plugin-external-globals';
import path from 'path';

const externalGlobalsObj = {
    vue: 'Vue',
    'vue-demi': 'VueDemi',
    'element-plus': 'ElementPlus'
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const proxy = {};
    const { VITE_PROXY } = loadEnv(mode, process.cwd());
    if (VITE_PROXY) {
        JSON.parse(VITE_PROXY).forEach(([key, value]) => {
            proxy[key] = {
                target: value,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            };
        });
    }
    return {
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
                    // LocalForage
                    {
                        name: 'localforage',
                        var: 'localforage',
                        path: `https://cdn.staticfile.net/localforage/1.10.0/localforage.min.js`
                    },

                    // Vue
                    {
                        name: 'vue',
                        var: 'Vue',
                        path: `https://cdn.staticfile.net/vue/3.3.4/vue.global.prod.min.js`,
                        css: [
                            // Normalize 样式重置
                            'https://cdn.staticfile.net/normalize/8.0.1/normalize.min.css'
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
                        path: 'https://cdn.staticfile.net/element-plus/2.3.14/index.full.min.js',
                        css: [
                            'https://cdn.staticfile.net/element-plus/2.3.14/index.css',
                            'https://registry.npmmirror.com/element-plus/2.3.14/files/theme-chalk/dark/css-vars.css'
                        ]
                    },
                    {
                        name: 'element-plus/dist/locale/zh-cn.min.mjs',
                        var: 'ElementPlusLocaleZhCn',
                        path: 'https://cdn.staticfile.net/element-plus/2.3.14/locale/zh-cn.min.js'
                    },

                    // vxe-table组件库
                    {
                        name: 'xe-utils',
                        var: 'XEUtils',
                        path: 'https://unpkg.shop.jd.com/xe-utils@3.5.13/dist/xe-utils.umd.min.js'
                    },
                    {
                        name: 'vxe-table',
                        var: 'VXETable',
                        path: 'https://unpkg.shop.jd.com/vxe-table@4.5.12/lib/index.umd.min.js',
                        css: ['https://unpkg.shop.jd.com/vxe-table@4.5.12/lib/style.css']
                    },

                    // canvas-nest.js
                    {
                        name: 'canvas-nest.js',
                        var: 'CanvasNest',
                        path: 'https://cdn.staticfile.net/canvas-nest.js/2.0.4/canvas-nest.umd.js'
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
            'process.env': { VUE_APP_ENV: mode }
        },
        server: { proxy }
    };
});
