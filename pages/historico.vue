<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-1">
      <v-icon class="mr-2" color="primary" :icon="mdiHistory" />
      Histórico de Sessões
    </h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">
      Visualize, filtre e gerencie todas as suas sessões de estudo
    </p>

    <!-- Filtros -->
    <v-card color="surface" class="pa-4 mb-6">
      <v-row align="center">
        <v-col cols="12" sm="4">
          <v-select
            v-model="filtroMateria"
            label="Filtrar por Matéria"
            :items="['Todas', ...materias]"
            :prepend-inner-icon="mdiFilterVariant"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="4">
          <v-text-field
            v-model="filtroDataInicio"
            label="Data Início"
            type="date"
            :prepend-inner-icon="mdiCalendarStart"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="4">
          <v-text-field
            v-model="filtroDataFim"
            label="Data Fim"
            type="date"
            :prepend-inner-icon="mdiCalendarEnd"
            clearable
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabela -->
    <v-card color="surface">
      <v-data-table
        :headers="headers"
        :items="sessoesFiltradas"
        :items-per-page="10"
        :no-data-text="'Nenhuma sessão encontrada'"
        :items-per-page-text="'Itens por página'"
        class="bg-surface"
        :mobile="smAndDown"
      >
        <!-- Coluna Data -->
        <template #item.date="{ item }">
          <v-chip size="small" variant="tonal" color="info" :prepend-icon="mdiCalendar">
            {{ formatarData(item.date) }}
          </v-chip>
        </template>

        <!-- Coluna Matéria -->
        <template #item.subject="{ item }">
          <v-chip
            size="small"
            variant="flat"
            :color="CORES_MATERIAS[item.subject]"
            :prepend-icon="ICONES_MATERIAS[item.subject]"
          >
            {{ item.subject }}
          </v-chip>
        </template>

        <!-- Coluna Desempenho -->
        <template #item.score="{ item }">
          <div class="ga-2">
            <span class="text-success font-weight-bold">{{ item.correctQuestions }}</span>
            <span class="text-medium-emphasis">/</span>
            <span>{{ item.totalQuestions }}</span>
            <v-chip
              size="x-small"
              :color="corTaxa(item)"
              variant="flat"
              class="ml-1"
            >
              {{ taxaItem(item) }}%
            </v-chip>
          </div>
        </template>

        <!-- Coluna Motivo -->
        <template #item.primaryErrorReason="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="item.primaryErrorReason ? CORES_MOTIVOS[item.primaryErrorReason] : 'success'"
            :prepend-icon="iconeMotivo(item.primaryErrorReason)"
          >
            {{ item.primaryErrorReason ?? 'Sem erros' }}
          </v-chip>
        </template>

        <!-- Coluna Ações -->
        <template #item.actions="{ item }">
          <div class="ga-1 justify-start">
            <v-btn
              :icon="mdiPencilOutline"
              size="small"
              variant="text"
              color="info"
              @click="editarSessao(item)"
            >
              <v-icon :icon="mdiPencilOutline" />
              <v-tooltip activator="parent" location="top">
                <span class="text-white">Editar sessão</span>
              </v-tooltip>
            </v-btn>

            <v-btn
              :icon="mdiContentDuplicate"
              size="small"
              variant="text"
              color="secondary"
              @click="duplicarSessao(item)"
            >
              <v-icon :icon="mdiContentDuplicate" />
              <v-tooltip activator="parent" location="top">
                <span class="text-white">Duplicar sessão</span>
              </v-tooltip>
            </v-btn>

            <v-btn
              :icon="mdiDeleteOutline"
              size="small"
              variant="text"
              color="error"
              @click="confirmarExclusao(item)"
            >
              <v-icon :icon="mdiDeleteOutline" />
              <v-tooltip activator="parent" location="top">
                <span class="text-white">Excluir sessão</span>
              </v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- Rodapé com resumo -->
        <template #bottom>
          <v-divider />
          <div class="d-flex flex-wrap align-center justify-space-between pa-4 ga-4">
            <div class="d-flex flex-wrap ga-4">
              <span class="text-body-2 text-medium-emphasis">
                <strong>{{ sessoesFiltradas.length }}</strong> sessões
              </span>
              <span class="text-body-2 text-medium-emphasis">
                <strong>{{ totalFiltrado }}</strong> questões
              </span>
              <span class="text-body-2 text-success">
                <strong>{{ acertosFiltrado }}</strong> acertos
              </span>
              <span class="text-body-2 text-error">
                <strong>{{ errosFiltrado }}</strong> erros
              </span>
              <span class="text-body-2" :class="corTaxaFiltrada">
                Taxa: <strong>{{ taxaFiltrada }}%</strong>
              </span>
            </div>

            <v-btn
              v-if="store.sessions.length > 0"
              variant="outlined"
              color="error"
              size="small"
              :prepend-icon="mdiDeleteSweep"
              @click="dialogLimpar = true"
            >
              Limpar Tudo
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo de confirmação de exclusão -->
    <v-dialog v-model="dialogExcluir" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="error" :icon="mdiAlertCircle" />
          Confirmar Exclusão
        </v-card-title>

        <v-card-text>
          Tem certeza que deseja excluir esta sessão de
          <strong>{{ sessaoParaExcluir?.subject }}</strong>
          do dia <strong>{{ sessaoParaExcluir ? formatarData(sessaoParaExcluir.date) : '' }}</strong>?
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogExcluir = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" @click="excluirSessao">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de limpar tudo -->
    <v-dialog v-model="dialogLimpar" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="error" :icon="mdiDeleteSweep" />
          Limpar Todos os Dados
        </v-card-title>

        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-3">
            Esta ação é irreversível!
          </v-alert>
          Tem certeza que deseja excluir <strong>todas as {{ store.sessions.length }}</strong>
          sessões registradas?
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogLimpar = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" @click="limparTudo">Limpar Tudo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de edição / duplicação -->  
    <v-dialog v-model="dialogFormulario" :fullscreen="smAndDown" max-width="960" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon
            class="mr-2"
            :icon="duplicandoId ? mdiContentDuplicate : mdiPencilOutline"
            :color="duplicandoId ? 'secondary' : 'info'"
          />
          {{ duplicandoId ? 'Duplicar Sessão' : 'Editar Sessão' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <SessionForm
            :edit-id="editandoId ?? undefined"
            :duplicate-id="duplicandoId ?? undefined"
            @success="onFormSuccess"
            @cancel="fecharFormulario"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom center">
      <v-icon class="mr-2" :icon="snackbarIcon" />
      {{ snackbarMsg }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import {
  mdiHistory,
  mdiFilterVariant,
  mdiCalendarStart,
  mdiCalendarEnd,
  mdiCalendar,
  mdiPencilOutline,
  mdiContentDuplicate,
  mdiDeleteOutline,
  mdiDeleteSweep,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiCheckDecagram,
  mdiMagnifyClose,
  mdiBookRemove,
  mdiRunFast,
} from '@mdi/js'
import {
  MATERIAS,
  CORES_MATERIAS,
  CORES_MOTIVOS,
  ICONES_MATERIAS,
  type Session,
  type MotivoErro,
} from '~/types'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const store = useStudyStore()

const materias = MATERIAS

// Filtros
const filtroMateria = ref<string | null>(null)
const filtroDataInicio = ref<string | null>(null)
const filtroDataFim = ref<string | null>(null)

// Diálogos
const dialogFormulario = ref(false)
const editandoId = ref<string | null>(null)
const duplicandoId = ref<string | null>(null)
const dialogExcluir = ref(false)
const dialogLimpar = ref(false)
const sessaoParaExcluir = ref<Session | null>(null)

// Snackbar
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref(mdiCheckCircle)

const headers = [
  { title: 'Data', key: 'date', sortable: true },
  { title: 'Matéria', key: 'subject', sortable: true },
  { title: 'Desempenho', key: 'score', sortable: false },
  { title: 'Motivo do Erro', key: 'primaryErrorReason', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

const sessoesFiltradas = computed(() => {
  let resultado = [...store.sessions]

  // Filtro por matéria
  if (filtroMateria.value && filtroMateria.value !== 'Todas') {
    resultado = resultado.filter(s => s.subject === filtroMateria.value)
  }

  // Filtro por data início
  if (filtroDataInicio.value) {
    resultado = resultado.filter(s => s.date >= filtroDataInicio.value!)
  }

  // Filtro por data fim
  if (filtroDataFim.value) {
    resultado = resultado.filter(s => s.date <= filtroDataFim.value!)
  }

  // Ordenar por data decrescente
  resultado.sort((a, b) => b.date.localeCompare(a.date))

  return resultado
})

// Resumo do filtro
const totalFiltrado = computed(() =>
  sessoesFiltradas.value.reduce((acc, s) => acc + s.totalQuestions, 0),
)

const acertosFiltrado = computed(() =>
  sessoesFiltradas.value.reduce((acc, s) => acc + s.correctQuestions, 0),
)

const errosFiltrado = computed(() =>
  sessoesFiltradas.value.reduce((acc, s) => acc + s.wrongQuestions, 0),
)

const taxaFiltrada = computed(() => {
  if (totalFiltrado.value === 0) return 0
  return Math.round((acertosFiltrado.value / totalFiltrado.value) * 100)
})

const corTaxaFiltrada = computed(() => {
  if (taxaFiltrada.value >= 70) return 'text-success'
  if (taxaFiltrada.value >= 50) return 'text-warning'
  return 'text-error'
})

function formatarData(dateStr: string): string {
  const [ano, mes, dia] = dateStr.split('-')
  return `${dia}/${mes}/${ano}`
}

function taxaItem(item: Session): number {
  if (item.totalQuestions === 0) return 0
  return Math.round((item.correctQuestions / item.totalQuestions) * 100)
}

function corTaxa(item: Session): string {
  const taxa = taxaItem(item)
  if (taxa >= 70) return 'success'
  if (taxa >= 50) return 'warning'
  return 'error'
}

function iconeMotivo(motivo: MotivoErro | null): string {
  if (motivo === null) return mdiCheckDecagram
  const icones: Record<MotivoErro, string> = {
    'Errei na Interpretação': mdiMagnifyClose,
    'Faltou Conteúdo': mdiBookRemove,
    'Fiz Depressa': mdiRunFast,
  }
  return icones[motivo]
}

function editarSessao(sessao: Session) {
  duplicandoId.value = null
  editandoId.value = sessao.id
  dialogFormulario.value = true
}

function duplicarSessao(sessao: Session) {
  editandoId.value = null
  duplicandoId.value = sessao.id
  dialogFormulario.value = true
}

function fecharFormulario() {
  dialogFormulario.value = false
  editandoId.value = null
  duplicandoId.value = null
}

function onFormSuccess(message: string) {
  fecharFormulario()
  mostrarSnackbar(message, 'success', mdiCheckCircle)
}

function confirmarExclusao(sessao: Session) {
  sessaoParaExcluir.value = sessao
  dialogExcluir.value = true
}

function excluirSessao() {
  if (!sessaoParaExcluir.value) return
  store.deleteSession(sessaoParaExcluir.value.id)
  dialogExcluir.value = false
  sessaoParaExcluir.value = null
  mostrarSnackbar('Sessão excluída com sucesso!', 'success', mdiCheckCircle)
}

function limparTudo() {
  store.clearAllSessions()
  dialogLimpar.value = false
  mostrarSnackbar('Todos os dados foram removidos!', 'warning', mdiDeleteSweep)
}

function mostrarSnackbar(msg: string, color: string, icon: string) {
  snackbarMsg.value = msg
  snackbarColor.value = color
  snackbarIcon.value = icon
  snackbar.value = true
}
</script>
