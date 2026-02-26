import { z } from 'zod'

export const Materia = z.enum([
    'Matemática',
    'Linguagens',
    'Física',
    'Química',
    'Biologia',
    'História',
    'Geografia',
    'Sociologia',
    'Filosofia',
])

export type Materia = z.infer<typeof Materia>

export const MATERIAS = Materia.options

export const MotivoErro = z.enum([
    'Errei na Interpretação',
    'Faltou Conteúdo',
    'Fiz Depressa',
])

export type MotivoErro = z.infer<typeof MotivoErro>

export const MOTIVOS_ERRO = MotivoErro.options

export const SessionSchema = z.object({
    id: z.string().uuid(),
    date: z.string().min(1, 'Data é obrigatória'),
    subject: Materia,
    totalQuestions: z.number().int().min(1, 'Mínimo de 1 questão'),
    wrongQuestions: z.number().int().min(0, 'Não pode ser negativo'),
    correctQuestions: z.number().int().min(0),
    primaryErrorReason: MotivoErro,
}).refine(
    data => data.wrongQuestions <= data.totalQuestions,
    {
        message: 'Questões erradas não pode ser maior que o total',
        path: ['wrongQuestions'],
    },
)

export type Session = z.infer<typeof SessionSchema>

export const SessionFormSchema = z.object({
    date: z.string().min(1, 'Data é obrigatória'),
    subject: Materia,
    totalQuestions: z.number().int().min(1, 'Mínimo de 1 questão'),
    wrongQuestions: z.number().int().min(0, 'Não pode ser negativo'),
    primaryErrorReason: MotivoErro,
}).refine(
    data => data.wrongQuestions <= data.totalQuestions,
    {
        message: 'Questões erradas não pode ser maior que o total',
        path: ['wrongQuestions'],
    },
)

export type SessionForm = z.infer<typeof SessionFormSchema>

export const GoalSchema = z.object({
    dailyTarget: z.number().int().min(1).default(30),
    weeklyTarget: z.number().int().min(1).default(150),
})

export type Goal = z.infer<typeof GoalSchema>

export const CORES_MATERIAS: Record<Materia, string> = {
    'Matemática': '#4285F4',
    'Linguagens': '#EA4335',
    'Física': '#FBBC04',
    'Química': '#34A853',
    'Biologia': '#FF6D01',
    'História': '#46BDC6',
    'Geografia': '#7BAAF7',
    'Sociologia': '#F07B72',
    'Filosofia': '#AB47BC',
}

export const CORES_MOTIVOS: Record<MotivoErro, string> = {
    'Errei na Interpretação': '#FF5252',
    'Faltou Conteúdo': '#FFC107',
    'Fiz Depressa': '#2196F3',
}

export const ICONES_MATERIAS: Record<Materia, string> = {
    'Matemática': 'mdi-calculator-variant',
    'Linguagens': 'mdi-book-open-page-variant',
    'Física': 'mdi-atom',
    'Química': 'mdi-flask',
    'Biologia': 'mdi-dna',
    'História': 'mdi-castle',
    'Geografia': 'mdi-earth',
    'Sociologia': 'mdi-account-group',
    'Filosofia': 'mdi-head-lightbulb',
}
