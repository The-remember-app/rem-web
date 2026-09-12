
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
//
// export default defineConfig({
//     // plugins: [
//     //     react({
//     //         tsDecorators: true,
//     //     }),
//     // ],
//     resolve: {
//
//     },
// });

export default defineConfig(() => ({
    root: import.meta.dirname,
    cacheDir: '../node_modules/.vite/front-thread',
    compilerOptions: {
        types: ["vite/client"]
    },
    server: {
        port: 4200,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://localhost:10012',
                changeOrigin: true,
                secure: false, // Отключает строгую проверку SSL (актуально для Keenetic/самоподписанных сертификатов)
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    preview: {
        port: 4300,
        host: 'localhost',
    },
    plugins: [
        react()
    ],
    watch: {
        usePolling: true, // Гарантирует отслеживание изменений файлов в смонтированных папках
        interval: 100,
    },
    hmr: {
        host: 'localhost',
        port: 24678, // Выделенный порт для HMR WebSocket
    },

    // Uncomment this if you are using workers.
    // bridge: {
    //  plugins: [],
    // },
    resolve: {
        tsconfigPaths: true ,
        // alias: {
        //     '@rem-user-service/domain': path.resolve(import.meta.dirname, '../../libs/domain/src/index.ts'),
        // },
        // alias: {
        //     // Игнорируем Node.js драйвер в браузерной сборке
        //     'better-sqlite3': path.resolve(__dirname, './src/empty-stub.js'),
        // },
    },
    // optimizeDeps: {
    //     exclude: ['@nozbe/watermelondb'],
    // },
    build: {
        'emptyOutDir': true,
        'transformMixedEsModules': true,
        'outDir': "./dist",
        'reportCompressedSize': true,
        'commonjsOptions': { "transformMixedEsModules": true },
    },
    test: {
        'name': '@rem-front-thread/front-thread-host',
        'watch': false,
        'globals': true,
        'environment': "jsdom",
        'include': ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        'reporters': ["default"],
        'coverage': {
            'reportsDirectory': './test-output/vitest/coverage',
            'provider': 'v8' as const,
        }
    },


}));