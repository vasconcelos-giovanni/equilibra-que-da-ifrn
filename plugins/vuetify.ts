import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { pt } from 'vuetify/locale'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin(app => {
    const vuetify = createVuetify({
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
