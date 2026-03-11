import { defineStore } from 'pinia'
import type { Session, SessionForm, Goal } from '~/types'
import { LocalStorageSchema } from '~/types'

export interface BackupFile {
    exportedAt: string
    sessions: Session[]
    goal: Goal
}

export type ImportResult =
    | { ok: true; exportedAt: string; sessionCount: number }
    | { ok: false; error: string }

export const useStudyStore = defineStore('study', () => {
    const sessions = ref<Session[]>([])
    const goal = ref<Goal>({ dailyTarget: 30, weeklyTarget: 150 })

    function addSession(form: SessionForm): Session {
        const session: Session = {
            id: crypto.randomUUID(),
            date: form.date,
            subject: form.subject,
            totalQuestions: form.totalQuestions,
            wrongQuestions: form.wrongQuestions,
            correctQuestions: form.totalQuestions - form.wrongQuestions,
            primaryErrorReason: form.primaryErrorReason,
        }
        sessions.value.push(session)
        return session
    }

    function updateSession(id: string, form: SessionForm): void {
        const index = sessions.value.findIndex(s => s.id === id)
        if (index === -1) return

        sessions.value[index] = {
            ...sessions.value[index],
            date: form.date,
            subject: form.subject,
            totalQuestions: form.totalQuestions,
            wrongQuestions: form.wrongQuestions,
            correctQuestions: form.totalQuestions - form.wrongQuestions,
            primaryErrorReason: form.primaryErrorReason,
        }
    }

    function deleteSession(id: string): void {
        sessions.value = sessions.value.filter(s => s.id !== id)
    }

    function getSessionById(id: string): Session | undefined {
        return sessions.value.find(s => s.id === id)
    }

    function updateGoal(newGoal: Goal): void {
        goal.value = { ...newGoal }
    }

    function clearAllSessions(): void {
        sessions.value = []
    }

    function exportData(): void {
        const payload: BackupFile = {
            exportedAt: new Date().toISOString(),
            sessions: sessions.value,
            goal: goal.value,
        }

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const date = new Date().toISOString().split('T')[0]

        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `backup-equilibra-${date}.json`
        anchor.click()

        URL.revokeObjectURL(url)
    }

    function importData(jsonString: string): ImportResult {
        let raw: unknown
        try {
            raw = JSON.parse(jsonString)
        }
        catch {
            return { ok: false, error: 'Arquivo de backup inválido ou corrompido.' }
        }

        const result = LocalStorageSchema.safeParse(raw)
        if (!result.success) {
            return { ok: false, error: 'Arquivo de backup inválido ou corrompido.' }
        }

        sessions.value = result.data.sessions
        goal.value = result.data.goal

        const exportedAt = (raw as Partial<BackupFile>).exportedAt ?? ''
        const sessionCount = result.data.sessions.length

        // Força reload para garantir reatividade do Chart.js e dos composables
        window.location.reload()

        return { ok: true, exportedAt, sessionCount }
    }

    return {
        sessions,
        goal,
        addSession,
        updateSession,
        deleteSession,
        getSessionById,
        updateGoal,
        clearAllSessions,
        exportData,
        importData,
    }
}, {
    persist: {
        storage: localStorage,
        key: 'enem-tracker-data',
        // Desserialização com validação Zod: dados corrompidos são descartados
        // silenciosamente e substituídos pelo estado padrão, evitando erros em
        // runtime e Layout Shift causado por re-renders após falha de hidratação.
        serializer: {
            serialize: JSON.stringify,
            deserialize: (raw: string) => {
                try {
                    const parsed = JSON.parse(raw)
                    const result = LocalStorageSchema.safeParse(parsed)
                    if (result.success) return result.data
                    console.warn('[study store] Dados do localStorage inválidos, usando estado padrão.', result.error.flatten())
                    return LocalStorageSchema.parse({})
                }
                catch {
                    return LocalStorageSchema.parse({})
                }
            },
        },
    },
})
