import { defineStore } from 'pinia'
import type { Session, SessionForm, Goal } from '~/types'

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

    return {
        sessions,
        goal,
        addSession,
        updateSession,
        deleteSession,
        getSessionById,
        updateGoal,
        clearAllSessions,
    }
}, {
    persist: {
        storage: localStorage,
        key: 'enem-tracker-data',
    },
})
