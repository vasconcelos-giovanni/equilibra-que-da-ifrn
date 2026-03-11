<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-1">
      <v-icon class="mr-2" color="primary" :icon="mdiPlusCircleOutline" />
      Registrar Sessão de Estudo
    </h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">
      Preencha os dados da sua sessão de resolução de questões
    </p>

    <v-row>
      <v-col cols="12" md="7">
        <v-card color="surface" class="pa-6">
          <v-form ref="formRef" @submit.prevent="salvar">
            <v-row>
              <!-- Data -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.date"
                  label="Data"
                  type="date"
                  :prepend-inner-icon="mdiCalendar"
                  :error-messages="erros.date"
                  @update:model-value="validarCampo('date')"
                />
              </v-col>

              <!-- Matéria -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.subject"
                  label="Matéria"
                  :items="materias"
                  :prepend-inner-icon="mdiBookEducation"
                  :error-messages="erros.subject"
                  @update:model-value="validarCampo('subject')"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template #prepend>
                        <v-icon
                          :color="CORES_MATERIAS[item.value as Materia]"
                          :icon="ICONES_MATERIAS[item.value as Materia]"
                        />
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <!-- Total de questões -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.totalQuestions"
                  label="Questões Respondidas"
                  type="number"
                  :prepend-inner-icon="mdiHelpCircleOutline"
                  :min="1"
                  :error-messages="erros.totalQuestions"
                  @update:model-value="validarCampo('totalQuestions')"
                />
              </v-col>

              <!-- Questões erradas -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.wrongQuestions"
                  label="Questões Erradas"
                  type="number"
                  :prepend-inner-icon="mdiCloseCircleOutline"
                  :min="0"
                  :max="form.totalQuestions || undefined"
                  :error-messages="erros.wrongQuestions"
                  @update:model-value="validarCampo('wrongQuestions')"
                />
              </v-col>

              <!-- Motivo do erro -->
              <v-col cols="12">
                <v-select
                  v-model="form.primaryErrorReason"
                  label="Principal motivo dos erros"
                  :items="motivos"
                  :prepend-inner-icon="mdiAlertCircleOutline"
                  :disabled="form.wrongQuestions === 0"
                  :hint="form.wrongQuestions === 0 ? 'Desativado porque não houve erros' : ''"
                  :persistent-hint="form.wrongQuestions === 0"
                  :error-messages="erros.primaryErrorReason"
                  @update:model-value="validarCampo('primaryErrorReason')"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template #prepend>
                        <v-icon
                          :color="CORES_MOTIVOS[item.value as MotivoErro]"
                          :icon="iconeMotivo(item.value as MotivoErro)"
                        />
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="d-flex flex-wrap ga-3">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :prepend-icon="mdiContentSave"
                :loading="salvando"
              >
                {{ editandoId ? 'Atualizar' : 'Registrar' }}
              </v-btn>

              <v-btn
                variant="outlined"
                size="large"
                :prepend-icon="mdiEraser"
                @click="limparForm"
              >
                Limpar
              </v-btn>

              <v-btn
                v-if="editandoId"
                variant="text"
                size="large"
                :prepend-icon="mdiClose"
                @click="cancelarEdicao"
              >
                Cancelar Edição
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <!-- Feedback em tempo real -->
      <v-col cols="12" md="5">
        <v-card color="surface" class="pa-6">
          <p class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon size="20" class="mr-1" color="info" :icon="mdiCalculator" />
            Prévia em Tempo Real
          </p>

          <v-list bg-color="transparent" density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon color="info" :icon="mdiHelpCircleOutline" />
              </template>
              <v-list-item-title>Questões Respondidas</v-list-item-title>
              <template #append>
                <span class="text-h6 font-weight-bold">{{ form.totalQuestions || 0 }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="success" :icon="mdiCheckCircleOutline" />
              </template>
              <v-list-item-title>Acertos</v-list-item-title>
              <template #append>
                <span class="text-h6 font-weight-bold text-success">{{ acertosCalculados }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="error" :icon="mdiCloseCircleOutline" />
              </template>
              <v-list-item-title>Erros</v-list-item-title>
              <template #append>
                <span class="text-h6 font-weight-bold text-error">{{ form.wrongQuestions || 0 }}</span>
              </template>
            </v-list-item>

            <v-divider class="my-3" />

            <v-list-item>
              <template #prepend>
                <v-icon :color="corTaxa" :icon="mdiPercentOutline" />
              </template>
              <v-list-item-title class="font-weight-bold">Taxa de Acerto</v-list-item-title>
              <template #append>
                <span class="text-h5 font-weight-bold" :class="`text-${corTaxa}`">
                  {{ taxaCalculada }}%
                </span>
              </template>
            </v-list-item>
          </v-list>

          <v-progress-linear
            :model-value="taxaCalculada"
            :color="corTaxa"
            height="12"
            rounded
            class="mt-4"
          />

          <!-- Indicador visual de matéria selecionada -->
          <v-chip
            v-if="form.subject"
            class="mt-4"
            :color="CORES_MATERIAS[form.subject]"
            :prepend-icon="ICONES_MATERIAS[form.subject]"
            variant="flat"
          >
            {{ form.subject }}
          </v-chip>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar de sucesso -->
    <v-snackbar
      v-model="snackbar"
      color="success"
      timeout="3000"
      location="bottom center"
    >
      <v-icon class="mr-2" :icon="mdiCheckCircle" />
      {{ snackbarMsg }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import {
  mdiPlusCircleOutline,
  mdiCalendar,
  mdiBookEducation,
  mdiHelpCircleOutline,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiAlertCircleOutline,
  mdiContentSave,
  mdiEraser,
  mdiClose,
  mdiCalculator,
  mdiPercentOutline,
  mdiCheckCircle,
  mdiCheckDecagram,
  mdiMagnifyClose,
  mdiBookRemove,
  mdiRunFast,
} from '@mdi/js'
import {
  MATERIAS,
  MOTIVOS_ERRO,
  CORES_MATERIAS,
  CORES_MOTIVOS,
  ICONES_MATERIAS,
  SessionFormSchema,
  type Materia,
  type MotivoErro,
  type SessionForm,
} from '~/types'

const store = useStudyStore()
const route = useRoute()
const router = useRouter()

const materias = MATERIAS
const motivos = MOTIVOS_ERRO

const formRef = ref()
const salvando = ref(false)
const snackbar = ref(false)
const snackbarMsg = ref('')

const editandoId = ref<string | null>(null)

const form = ref<SessionForm>({
  date: new Date().toISOString().split('T')[0],
  subject: '' as Materia,
  totalQuestions: null as unknown as number,
  wrongQuestions: null as unknown as number,
  primaryErrorReason: null,
})

const erros = ref<Record<string, string[]>>({
  date: [],
  subject: [],
  totalQuestions: [],
  wrongQuestions: [],
  primaryErrorReason: [],
})

// Limpa o motivo automaticamente ao zerar as questões erradas
watch(() => form.value.wrongQuestions, (newVal) => {
  if (newVal === 0) {
    form.value.primaryErrorReason = null
    erros.value.primaryErrorReason = []
  }
})

// Verificar se veio um ID de edição via query string
onMounted(() => {
  const id = route.query.editar as string
  if (id) {
    const session = store.getSessionById(id)
    if (session) {
      editandoId.value = id
      form.value = {
        date: session.date,
        subject: session.subject,
        totalQuestions: session.totalQuestions,
        wrongQuestions: session.wrongQuestions,
        primaryErrorReason: session.primaryErrorReason,
      }
    }
  }
})

// Computações de preview em tempo real
const acertosCalculados = computed(() => {
  const total = form.value.totalQuestions || 0
  const errados = form.value.wrongQuestions || 0
  return Math.max(total - errados, 0)
})

const taxaCalculada = computed(() => {
  const total = form.value.totalQuestions || 0
  if (total === 0) return 0
  return Math.round((acertosCalculados.value / total) * 100)
})

const corTaxa = computed(() => {
  if (taxaCalculada.value >= 70) return 'success'
  if (taxaCalculada.value >= 50) return 'warning'
  return 'error'
})

function iconeMotivo(motivo: MotivoErro | null): string {
  if (motivo === null) return mdiCheckDecagram
  const icones: Record<MotivoErro, string> = {
    'Errei na Interpretação': mdiMagnifyClose,
    'Faltou Conteúdo': mdiBookRemove,
    'Fiz Depressa': mdiRunFast,
  }
  return icones[motivo]
}

function validarCampo(campo: string) {
  erros.value[campo] = []

  try {
    const partialSchema = SessionFormSchema.innerType()
    const result = partialSchema.shape[campo as keyof typeof partialSchema.shape]
    if (result) {
      result.parse((form.value as any)[campo])
    }
  }
  catch (err: any) {
    if (err.issues) {
      erros.value[campo] = err.issues.map((i: any) => i.message)
    }
  }
}

function validarTudo(): boolean {
  const result = SessionFormSchema.safeParse(form.value)
  if (result.success) {
    Object.keys(erros.value).forEach(k => (erros.value[k] = []))
    return true
  }

  Object.keys(erros.value).forEach(k => (erros.value[k] = []))
  for (const issue of result.error.issues) {
    const campo = issue.path[0] as string
    if (erros.value[campo]) {
      erros.value[campo].push(issue.message)
    }
  }
  return false
}

async function salvar() {
  if (!validarTudo()) return

  salvando.value = true

  // Simular delay para UX
  await new Promise(r => setTimeout(r, 300))

  if (editandoId.value) {
    store.updateSession(editandoId.value, form.value)
    snackbarMsg.value = 'Sessão atualizada com sucesso!'
    editandoId.value = null
    router.replace({ query: {} })
  }
  else {
    store.addSession(form.value)
    snackbarMsg.value = 'Sessão registrada com sucesso!'
  }

  snackbar.value = true
  salvando.value = false
  limparForm()
}

function limparForm() {
  form.value = {
    date: new Date().toISOString().split('T')[0],
    subject: '' as Materia,
    totalQuestions: null as unknown as number,
    wrongQuestions: null as unknown as number,
    primaryErrorReason: null,
  }
  Object.keys(erros.value).forEach(k => (erros.value[k] = []))
}

function cancelarEdicao() {
  editandoId.value = null
  router.replace({ query: {} })
  limparForm()
}
</script>
