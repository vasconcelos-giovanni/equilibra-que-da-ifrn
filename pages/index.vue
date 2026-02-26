<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-1">
      <v-icon class="mr-2" color="primary">mdi-view-dashboard</v-icon>
      Painel de Desempenho
    </h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">
      Acompanhe seu progresso na resolução de questões do ENEM
    </p>

    <!-- KPIs -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-caption text-medium-emphasis mb-1">Total de Questões</p>
              <p class="text-h4 font-weight-bold">{{ stats.totalQuestoes.value }}</p>
            </div>
            <v-avatar color="primary" size="48">
              <v-icon size="24">mdi-help-circle-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-caption text-medium-emphasis mb-1">Acertos</p>
              <p class="text-h4 font-weight-bold text-success">{{ stats.totalAcertos.value }}</p>
            </div>
            <v-avatar color="success" size="48">
              <v-icon size="24">mdi-check-circle-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-caption text-medium-emphasis mb-1">Erros</p>
              <p class="text-h4 font-weight-bold text-error">{{ stats.totalErros.value }}</p>
            </div>
            <v-avatar color="error" size="48">
              <v-icon size="24">mdi-close-circle-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="surface" class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-caption text-medium-emphasis mb-1">Taxa de Acerto</p>
              <p class="text-h4 font-weight-bold" :class="corTaxaAcerto">
                {{ stats.taxaAcerto.value }}%
              </p>
            </div>
            <v-avatar :color="corAvatarTaxa" size="48">
              <v-icon size="24">mdi-percent-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Metas -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6">
        <v-card color="surface" class="pa-4">
          <p class="text-subtitle-2 text-medium-emphasis mb-2">
            <v-icon size="18" class="mr-1">mdi-calendar-today</v-icon>
            Meta Diária
          </p>
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-body-2">
              {{ stats.questoesHoje.value }} / {{ store.goal.dailyTarget }} questões
            </span>
            <span class="text-body-2 font-weight-bold">
              {{ stats.progressoMetaDiaria.value }}%
            </span>
          </div>
          <v-progress-linear
            :model-value="stats.progressoMetaDiaria.value"
            color="primary"
            height="10"
            rounded
          />
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card color="surface" class="pa-4">
          <p class="text-subtitle-2 text-medium-emphasis mb-2">
            <v-icon size="18" class="mr-1">mdi-calendar-week</v-icon>
            Meta Semanal
          </p>
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-body-2">
              {{ stats.questoesSemana.value }} / {{ store.goal.weeklyTarget }} questões
            </span>
            <span class="text-body-2 font-weight-bold">
              {{ stats.progressoMetaSemanal.value }}%
            </span>
          </div>
          <v-progress-linear
            :model-value="stats.progressoMetaSemanal.value"
            color="secondary"
            height="10"
            rounded
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row>
      <v-col cols="12" md="7">
        <v-card color="surface" class="pa-4">
          <p class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon size="20" class="mr-1" color="primary">mdi-chart-bar</v-icon>
            Acerto por Matéria
          </p>
          <div v-if="store.sessions.length > 0" class="chart-container">
            <Bar :data="stats.chartAcertoPorMateria.value" :options="barOptions" />
          </div>
          <v-empty-state
            v-else
            icon="mdi-chart-bar"
            title="Sem dados para exibir"
            text="Registre sessões de estudo para ver seu desempenho por matéria."
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card color="surface" class="pa-4">
          <p class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon size="20" class="mr-1" color="warning">mdi-chart-donut</v-icon>
            Por que Errei?
          </p>
          <div v-if="store.sessions.length > 0" class="chart-container d-flex justify-center">
            <Doughnut
              :data="stats.chartDistribuicaoMotivos.value"
              :options="doughnutOptions"
            />
          </div>
          <v-empty-state
            v-else
            icon="mdi-chart-donut"
            title="Sem dados para exibir"
            text="Registre sessões para visualizar os motivos de erro."
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráfico de evolução -->
    <v-row class="mt-2">
      <v-col cols="12">
        <v-card color="surface" class="pa-4">
          <p class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon size="20" class="mr-1" color="success">mdi-chart-line</v-icon>
            Evolução de Acertos ao Longo do Tempo
          </p>
          <div v-if="store.sessions.length > 0" class="chart-container">
            <Line :data="stats.chartEvolucaoAcertos.value" :options="lineOptions" />
          </div>
          <v-empty-state
            v-else
            icon="mdi-chart-line"
            title="Sem dados para exibir"
            text="Com o tempo, seu gráfico de evolução aparecerá aqui."
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Botão flutuante para registrar -->
    <v-btn
      color="primary"
      size="large"
      icon="mdi-plus"
      position="fixed"
      location="bottom end"
      class="ma-6"
      elevation="8"
      to="/registrar"
    />
  </div>
</template>

<script setup lang="ts">
import { Bar, Doughnut, Line } from 'vue-chartjs'

const store = useStudyStore()
const stats = useStatistics()

const corTaxaAcerto = computed(() => {
  const taxa = stats.taxaAcerto.value
  if (taxa >= 70) return 'text-success'
  if (taxa >= 50) return 'text-warning'
  return 'text-error'
})

const corAvatarTaxa = computed(() => {
  const taxa = stats.taxaAcerto.value
  if (taxa >= 70) return 'success'
  if (taxa >= 50) return 'warning'
  return 'error'
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.y}% de acerto`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value: any) => `${value}%`,
        color: '#ccc',
      },
      grid: { color: 'rgba(255,255,255,0.08)' },
    },
    x: {
      ticks: { color: '#ccc', maxRotation: 45 },
      grid: { display: false },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#ccc', padding: 16 },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0
          return `${ctx.label}: ${ctx.parsed} erros (${pct}%)`
        },
      },
    },
  },
  cutout: '60%',
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.y}% de acerto`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value: any) => `${value}%`,
        color: '#ccc',
      },
      grid: { color: 'rgba(255,255,255,0.08)' },
    },
    x: {
      ticks: { color: '#ccc' },
      grid: { display: false },
    },
  },
}
</script>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}
</style>
