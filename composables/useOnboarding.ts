import { driver } from 'driver.js'

const STORAGE_KEY = 'equilibra-onboarding-completo'

export function useOnboarding() {
    function iniciarTour(opts?: { openDrawer?: () => void }) {
        // Garante que o drawer esteja aberto para que os itens do menu sejam visíveis
        opts?.openDrawer?.()

        const tourDriver = driver({
            animate: true,
            // Impede fechamento acidental ao clicar na sobreposição — especialmente
            // importante no Passo 2 (privacidade), onde a atenção total é necessária.
            allowClose: false,
            nextBtnText: 'Próximo',
            prevBtnText: 'Anterior',
            doneBtnText: 'Finalizar',
            popoverClass: 'equilibra-popover',

            onDestroyStarted: () => {
                localStorage.setItem(STORAGE_KEY, 'true')
                tourDriver.destroy()
            },

            steps: [
                {
                    element: '.v-toolbar-title',
                    popover: {
                        title: 'Bem-vindo ao Equilibra Que Dá!',
                        description:
                            'Seu assistente para o ENEM desenvolvido no Campus Nova Cruz.',
                        side: 'bottom',
                        align: 'start',
                    },
                },
                {
                    // Passo sem elemento: popover centralizado sobre o overlay
                    popover: {
                        title: '🔒 Seus dados são seus',
                        description:
                            '<strong>Atenção:</strong> Seus dados ficam salvos apenas NESTE dispositivo. Não usamos contas nem senhas.',
                    },
                },
                {
                    element: '#nav-registrar',
                    popover: {
                        title: 'Registrar Sessões',
                        description:
                            'Aqui você lança seus treinos. É fundamental anotar por que errou cada questão.',
                        side: 'right',
                        align: 'center',
                    },
                },
                {
                    element: '#nav-configuracoes',
                    popover: {
                        title: 'Configurações e Backup',
                        description:
                            'Aqui você define suas metas e faz o <strong>Backup</strong>. Salve seus dados se for trocar de celular!',
                        side: 'right',
                        align: 'center',
                    },
                },
            ],
        })

        tourDriver.drive()
    }

    function verificarOnboarding(opts?: { openDrawer?: () => void }) {
        onMounted(() => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                // Aguarda a renderização completa da UI antes de iniciar o tour
                setTimeout(() => iniciarTour(opts), 600)
            }
        })
    }

    return { iniciarTour, verificarOnboarding }
}
