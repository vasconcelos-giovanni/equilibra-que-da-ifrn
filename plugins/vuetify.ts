// @mdi/font removido — usamos @mdi/js com aliases SVG para tree-shaking completo.
// Apenas os ícones importados explicitamente em iconAliases entram no bundle.
import 'vuetify/styles'
import { pt } from 'vuetify/locale'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import {
    mdiCalculatorVariant,
    mdiBookOpenPageVariant,
    mdiAtom,
    mdiFlask,
    mdiDna,
    mdiCastle,
    mdiEarth,
    mdiAccountGroup,
    mdiHeadLightbulb
} from '@mdi/js'

export default defineNuxtPlugin(app => {
    const vuetify = createVuetify({
        icons: {
            defaultSet: 'mdi',
            aliases: {
                ...aliases,
                // Matérias
                calculatorVariant: mdiCalculatorVariant,
                bookOpenPageVariant: mdiBookOpenPageVariant,
                atom: mdiAtom,
                flask: mdiFlask,
                dna: mdiDna,
                castle: mdiCastle,
                earth: mdiEarth,
                accountGroup: mdiAccountGroup,
                headLightbulb: mdiHeadLightbulb,
            },
            sets: { mdi },
            // Mapa de ícones individuais para carregamento sob demanda via defineAsyncComponent
            // Os componentes acessam via `mdiXxx` importado diretamente do @mdi/js
        },
        locale: {
            locale: 'pt',
            messages: { pt },
        },
        theme: {
            defaultTheme: 'enemDark',
            themes: {
                enemDark: {
                    dark: true,
                    colors: {
                        background: '#303030',
                        surface: '#434343',
                        'surface-variant': '#3a3a3a',
                        primary: '#356854',
                        'primary-darken-1': '#284e3f',
                        secondary: '#3d85c6',
                        'secondary-darken-1': '#2a5d8a',
                        accent: '#4CAF50',
                        error: '#FF5252',
                        info: '#2196F3',
                        success: '#4CAF50',
                        warning: '#FFC107',
                        'on-background': '#f3f3f3',
                        'on-surface': '#f3f3f3',
                    },
                },
            },
        },
        defaults: {
            VCard: {
                rounded: 'lg',
                elevation: 4,
            },
            VBtn: {
                rounded: 'lg',
            },
            VTextField: {
                variant: 'outlined',
                density: 'comfortable',
            },
            VSelect: {
                variant: 'outlined',
                density: 'comfortable',
            },
            VDataTable: {
                hover: true,
            },
        },
    })

    app.vueApp.use(vuetify)
})
