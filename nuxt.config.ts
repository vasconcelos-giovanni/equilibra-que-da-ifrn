import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    ssr: false,

    app: {
        head: {
            title: 'Tabela de Controle - Resolução de Questões do ENEM',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Rastreador de questões do ENEM - Acompanhe seu progresso nos estudos' },
            ],
        },
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
    },
})
