<template>
  <v-layout>
    <v-app-bar flat color="primary-darken-1" density="comfortable">
      <template #prepend>
        <v-app-bar-nav-icon variant="text" @click="drawer = !drawer" />
      </template>

      <v-toolbar-title class="font-weight-bold">
        <v-icon class="mr-2" :icon="mdiSchool" />
        <span>Equilibra Que Dá!</span>
      </v-toolbar-title>

      <template #append>
        <v-btn
          :icon="mdiHelpCircleOutline"
          variant="text"
          title="Ajuda sobre backup"
          to="/ajuda-backup"
        />
      </template>
    </v-app-bar>

    <v-navigation-drawer
      :temporary="smAndDown"
      :permanent="mdAndUp"
      v-model="drawer"
      :expand-on-hover="mdAndUp"
      :rail="!drawer && mdAndUp"
      color="surface"
      rail-width="70"
      elevation="10"
      :width="280"
    >
      <v-list density="compact" class="mt-2">
        <v-list-item
          :prepend-icon="mdiSchool"
          title="Equilibra Que Dá!"
          class="mb-2"
        />
      </v-list>

      <v-divider />

      <v-list density="comfortable" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.path"
          :id="item.id"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.path"
          rounded="lg"
          class="my-1"
          active-color="primary"
        />
      </v-list>

      <v-list density="compact" nav class="mb-2">
        <v-list-item
          id="nav-configuracoes"
          :prepend-icon="mdiCogOutline"
          title="Configurações"
          rounded="lg"
          @click="dialogConfiguracoes = true"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="d-flex flex-column" style="min-height: 100vh;">
      <v-container :class="{ 'px-8': mdAndUp, 'px-4': smAndDown }" class="py-6 flex-grow-1">
        <slot />
      </v-container>

      <v-footer border class="py-4 mt-auto flex-grow-0">
        <div :class="mdAndUp ? 'd-flex align-center w-100 px-8' : 'text-center w-100'">
          <div class="d-flex align-center" :class="{ 'justify-center': !mdAndUp }">
            <v-img
              src="/assets/images/ifrn-logo.png"
              alt="Logo IFRN"
              width="45"
              height="45"
              class="mr-3"
              contain
            />
            <div class="text-left">
              <div class="text-subtitle-2 font-weight-bold" style="line-height: 1.2;">
                Equilibra Que Dá!
              </div>
              <div class="text-caption" style="line-height: 1.2;">
                Instituto Federal de Educação, Ciência e Tecnologia do Estado do Rio Grande do Norte - Campus Nova Cruz
              </div>
            </div>
          </div>

          <v-spacer v-if="mdAndUp" />
          <v-divider v-else class="my-3" />

          <div :class="{ 'text-right': mdAndUp }">
            <div class="text-caption">
              <strong>Idealização:</strong> Prof. Me. Igor Gacheiro da Silva
            </div>
            <div class="text-caption">
              <strong>Desenvolvimento:</strong> Giovanni Vasconcelos de Medeiros
            </div>
          </div>
        </div>
      </v-footer>
    </v-main>

    <v-dialog v-model="dialogConfiguracoes" max-width="440" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pt-5 px-6">
          <v-icon class="mr-2" color="primary" :icon="mdiCogOutline" />
          Configurações
        </v-card-title>

        <v-card-text class="px-6">
          <div class="text-subtitle-2 text-medium-emphasis mb-3">
            <v-icon size="16" class="mr-1" :icon="mdiTarget" />
            Metas de Estudo
          </div>

          <v-text-field
            v-model.number="metaForm.dailyTarget"
            label="Meta diária (questões)"
            type="number"
            :prepend-inner-icon="mdiCalendarToday"
            class="mb-3"
          />

          <v-text-field
            v-model.number="metaForm.weeklyTarget"
            label="Meta semanal (questões)"
            type="number"
            :prepend-inner-icon="mdiCalendarWeek"
          />

          <v-divider class="my-4" />

          <div class="text-subtitle-2 text-medium-emphasis mb-3">
            <v-icon size="16" class="mr-1" :icon="mdiDatabaseOutline" />
            Backup de Dados
          </div>

          <div class="text-body-2 text-medium-emphasis mb-4">
            Seus dados ficam apenas neste navegador. Use o backup para não perdê-los.
            <NuxtLink to="/ajuda-backup" class="ml-1" @click="dialogConfiguracoes = false">
              Saiba mais
            </NuxtLink>
          </div>

          <v-row dense>
            <v-col md="6" cols="12">
              <v-btn
                block
                variant="elevated"
                color="primary"
                :prepend-icon="mdiExportVariant"
                @click="baixarDados"
              >
                Baixar dados
              </v-btn>
            </v-col>
            <v-col md="6" cols="12">
              <v-btn
                block
                variant="elevated"
                color="secondary"
                :prepend-icon="mdiImport"
                @click="selecionarArquivo"
              >
                Restaurar dados
              </v-btn>
              <input
                ref="fileInputRef"
                type="file"
                accept=".json"
                class="d-none"
                @change="onFileSelecionado"
              >
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="text-subtitle-2 text-medium-emphasis mb-3">
            <v-icon size="16" class="mr-1" :icon="mdiSchoolOutline" />
            Tutorial
          </div>

          <v-btn
            block
            variant="outlined"
            color="light"
            :prepend-icon="mdiInformationOutline"
            @click="reiniciarTour"
          >
            Ver tutorial novamente
          </v-btn>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="dialogConfiguracoes = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="salvarMeta">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogConfirmacaoRestore" max-width="460" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pt-5 px-6 text-warning">
          <v-icon class="mr-2" :icon="mdiAlertOutline" />
          Confirmar Restauração
        </v-card-title>

        <v-card-text class="px-6">
          <v-alert type="warning" variant="tonal" class="mb-4">
            Isso substituirá <strong>todos</strong> os seus dados atuais por este arquivo.
          </v-alert>

          <div class="text-body-2 mb-1">
            <strong>Atividade atual:</strong> {{ ultimaAtividadeAtual }}
          </div>
          <div class="text-body-2">
            <strong>Data do backup:</strong> {{ dataDoBackup }}
          </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="cancelarRestore">Cancelar</v-btn>
          <v-btn color="warning" variant="elevated" @click="confirmarRestore">
            Sim, restaurar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import {
  mdiSchool, mdiViewDashboard, mdiPlusCircleOutline, mdiHistory,
  mdiCogOutline, mdiHelpCircleOutline, mdiTarget, mdiCalendarToday,
  mdiCalendarWeek, mdiDatabaseOutline, mdiExportVariant, mdiImport,
  mdiAlertOutline, mdiInformationOutline, mdiSchoolOutline
} from '@mdi/js'

const { mdAndUp, smAndDown } = useDisplay()
const drawer = ref(false)
const dialogConfiguracoes = ref(false)

const { iniciarTour, verificarOnboarding } = useOnboarding()
verificarOnboarding({ openDrawer: () => { drawer.value = true } })

function reiniciarTour() {
  dialogConfiguracoes.value = false
  nextTick(() => iniciarTour({ openDrawer: () => { drawer.value = true } }))
}
const dialogConfirmacaoRestore = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingJsonString = ref('')
const dataDoBackup = ref('')

const store = useStudyStore()

const metaForm = ref({
  dailyTarget: store.goal.dailyTarget,
  weeklyTarget: store.goal.weeklyTarget,
})

const menuItems = [
  { title: 'Painel', icon: mdiViewDashboard, path: '/', id: undefined },
  { title: 'Registrar', icon: mdiPlusCircleOutline, path: '/registrar', id: 'nav-registrar' },
  { title: 'Histórico', icon: mdiHistory, path: '/historico', id: undefined },
]

const ultimaAtividadeAtual = computed(() => {
  if (store.sessions.length === 0) return 'Nenhuma atividade'
  const ultima = [...store.sessions].sort((a, b) => b.date.localeCompare(a.date))[0]
  return new Date(ultima.date + 'T12:00:00').toLocaleDateString('pt-BR')
})

function salvarMeta() {
  store.updateGoal({ ...metaForm.value })
  dialogConfiguracoes.value = false
}

function baixarDados() {
  store.exportData()
}

function selecionarArquivo() {
  fileInputRef.value?.click()
}

function onFileSelecionado(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    pendingJsonString.value = text
    try {
      const parsed = JSON.parse(text)
      dataDoBackup.value = parsed.exportAt 
        ? new Date(parsed.exportAt).toLocaleDateString('pt-BR') 
        : 'Desconhecida'
    } catch {
      dataDoBackup.value = 'Arquivo inválido'
    }
    dialogConfiguracoes.value = false
    dialogConfirmacaoRestore.value = true
  }
  reader.readAsText(file)
  input.value = ''
}

function cancelarRestore() {
  dialogConfirmacaoRestore.value = false
  pendingJsonString.value = ''
}

function confirmarRestore() {
  store.importData(pendingJsonString.value)
}
</script>