import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',

    // SPA pura — todo rendering no cliente, zero Serverless Functions no Vercel.
    // O Vercel serve apenas a pasta .output/public/ via CDN Edge Network.
    ssr: false,

    app: {
        head: {
            title: 'Equilibra Que Dá!',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Equilibra Que Dá! - Acompanhe seu progresso nos estudos para o ENEM' },
            ],
            // Cache agressivo via Vercel headers (complementado pelo vercel.json)
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            ],
        },
    },

    // Geração estática como estratégia padrão de build
    nitro: {
        preset: 'static',
        // Compressão Brotli + Gzip para todos os assets estáticos
        compressPublicAssets: { brotli: true, gzip: true },
    },

    build: {
        transpile: ['vuetify'],
    },

    modules: [
        (_options, nuxt) => {
            nuxt.hooks.hook('vite:extendConfig', config => {
                config.plugins!.push(vuetify({ autoImport: true }))
            })
        },
    ],

    features: { inlineStyles: false },

    components: [{ path: '~/components', pathPrefix: false }],

    imports: { dirs: ['composables/**', 'stores/**'] },

    vite: {
        vue: { template: { transformAssetUrls } },
        build: {
            // Divide o bundle para que o Vuetify não bloqueie o carregamento inicial
            rollupOptions: {
                output: {
                    manualChunks: {
                        vuetify: ['vuetify'],
                        chartjs: ['chart.js', 'vue-chartjs'],
                    },
                },
            },
        },
    },
})
