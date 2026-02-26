import {
    MATERIAS,
    MOTIVOS_ERRO,
    CORES_MATERIAS,
    CORES_MOTIVOS,
    type Materia,
    type MotivoErro,
} from '~/types'

export function useStatistics() {
    const store = useStudyStore()
    // store é auto-importado via Nuxt

    const totalQuestoes = computed(() =>
        store.sessions.reduce((acc, s) => acc + s.totalQuestions, 0),
    )

    const totalAcertos = computed(() =>
        store.sessions.reduce((acc, s) => acc + s.correctQuestions, 0),
    )

    const totalErros = computed(() =>
        store.sessions.reduce((acc, s) => acc + s.wrongQuestions, 0),
    )

    const taxaAcerto = computed(() => {
        if (totalQuestoes.value === 0) return 0
        return Math.round((totalAcertos.value / totalQuestoes.value) * 100)
    })

    const totalSessoes = computed(() => store.sessions.length)

    // --- Dados para gráfico de barras: Acerto por matéria ---

    const acertoPorMateria = computed(() => {
        const resultado: Record<Materia, { total: number; certas: number }> = {} as any
        for (const materia of MATERIAS) {
            resultado[materia] = { total: 0, certas: 0 }
        }

        for (const session of store.sessions) {
            resultado[session.subject].total += session.totalQuestions
            resultado[session.subject].certas += session.correctQuestions
        }

        return resultado
    })

    const chartAcertoPorMateria = computed(() => {
        const materiasComDados = MATERIAS.filter(m => acertoPorMateria.value[m].total > 0)

        return {
            labels: materiasComDados,
            datasets: [
                {
                    label: '% de Acerto',
                    data: materiasComDados.map(m => {
                        const { total, certas } = acertoPorMateria.value[m]
                        return total > 0 ? Math.round((certas / total) * 100) : 0
                    }),
                    backgroundColor: materiasComDados.map(m => CORES_MATERIAS[m]),
                    borderColor: materiasComDados.map(m => CORES_MATERIAS[m]),
                    borderWidth: 1,
                    borderRadius: 6,
                },
            ],
        }
    })

    // --- Dados para gráfico doughnut: Distribuição de motivos de erro ---

    const distribuicaoMotivos = computed(() => {
        const resultado: Record<MotivoErro, number> = {} as any
        for (const motivo of MOTIVOS_ERRO) {
            resultado[motivo] = 0
        }

        for (const session of store.sessions) {
            if (session.wrongQuestions > 0) {
                resultado[session.primaryErrorReason] += session.wrongQuestions
            }
        }

        return resultado
    })

    const chartDistribuicaoMotivos = computed(() => {
        const motivosComDados = MOTIVOS_ERRO.filter(m => distribuicaoMotivos.value[m] > 0)

        return {
            labels: motivosComDados.length > 0 ? motivosComDados : MOTIVOS_ERRO,
            datasets: [
                {
                    data: motivosComDados.length > 0
                        ? motivosComDados.map(m => distribuicaoMotivos.value[m])
                        : [1, 1, 1],
                    backgroundColor: motivosComDados.length > 0
                        ? motivosComDados.map(m => CORES_MOTIVOS[m])
                        : Object.values(CORES_MOTIVOS).map(c => c + '33'),
                    borderColor: motivosComDados.length > 0
                        ? motivosComDados.map(m => CORES_MOTIVOS[m])
                        : Object.values(CORES_MOTIVOS),
                    borderWidth: 2,
                },
            ],
        }
    })

    // --- Meta diária ---

    const questoesHoje = computed(() => {
        const hoje = new Date().toISOString().split('T')[0]
        return store.sessions
            .filter(s => s.date === hoje)
            .reduce((acc, s) => acc + s.totalQuestions, 0)
    })

    const progressoMetaDiaria = computed(() => {
        if (store.goal.dailyTarget === 0) return 100
        return Math.min(Math.round((questoesHoje.value / store.goal.dailyTarget) * 100), 100)
    })

    // --- Meta semanal ---

    const questoesSemana = computed(() => {
        const hoje = new Date()
        const diaSemana = hoje.getDay()
        const inicio = new Date(hoje)
        inicio.setDate(hoje.getDate() - diaSemana)
        inicio.setHours(0, 0, 0, 0)

        const fim = new Date(inicio)
        fim.setDate(inicio.getDate() + 6)
        fim.setHours(23, 59, 59, 999)

        const inicioISO = inicio.toISOString().split('T')[0]
        const fimISO = fim.toISOString().split('T')[0]

        return store.sessions
            .filter(s => s.date >= inicioISO && s.date <= fimISO)
            .reduce((acc, s) => acc + s.totalQuestions, 0)
    })

    const progressoMetaSemanal = computed(() => {
        if (store.goal.weeklyTarget === 0) return 100
        return Math.min(Math.round((questoesSemana.value / store.goal.weeklyTarget) * 100), 100)
    })

    // --- Evolução de acertos ao longo do tempo (Line Chart) ---

    const chartEvolucaoAcertos = computed(() => {
        const sessoesOrdenadas = [...store.sessions].sort(
            (a, b) => a.date.localeCompare(b.date),
        )

        const porData = new Map<string, { total: number; certas: number }>()
        for (const s of sessoesOrdenadas) {
            const atual = porData.get(s.date) ?? { total: 0, certas: 0 }
            atual.total += s.totalQuestions
            atual.certas += s.correctQuestions
            porData.set(s.date, atual)
        }

        const datas = Array.from(porData.keys())
        const taxas = datas.map(d => {
            const { total, certas } = porData.get(d)!
            return total > 0 ? Math.round((certas / total) * 100) : 0
        })

        return {
            labels: datas.map(d => {
                const [, mes, dia] = d.split('-')
                return `${dia}/${mes}`
            }),
            datasets: [
                {
                    label: '% de Acerto',
                    data: taxas,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                },
            ],
        }
    })

    return {
        totalQuestoes,
        totalAcertos,
        totalErros,
        taxaAcerto,
        totalSessoes,
        acertoPorMateria,
        chartAcertoPorMateria,
        distribuicaoMotivos,
        chartDistribuicaoMotivos,
        questoesHoje,
        progressoMetaDiaria,
        questoesSemana,
        progressoMetaSemanal,
        chartEvolucaoAcertos,
    }
}
