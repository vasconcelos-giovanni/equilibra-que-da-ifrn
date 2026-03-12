<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-1">
      <v-icon class="mr-2" color="primary" :icon="mdiCogOutline" />
      Configurações
    </h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">
      Sincronização, metas, backup e preferências do aplicativo
    </p>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- 1 · SINCRONIZAÇÃO CLOUD — posicionado no topo conforme especificação -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center pt-5 px-6 flex-wrap ga-2">
        <v-icon class="mr-2" color="primary" :icon="mdiCloudSync" />
        Sincronização Cloud
        <v-spacer />
        <!-- Status badge -->
        <v-chip
          :color="syncState.isConnected ? 'success' : 'default'"
          :prepend-icon="syncState.isConnected ? mdiCheckCircleOutline : mdiCloudOffOutline"
          size="small"
          variant="tonal"
        >
          {{ syncState.isConnected ? 'Conectado' : 'Desconectado' }}
        </v-chip>
      </v-card-title>

      <v-card-text class="px-6">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Salve seus dados de estudo no seu <strong>Google Drive</strong>.
          Use seu e-mail do Gmail para não perder o progresso entre o
          computador e o celular.
        </p>

        <!-- ── Provedor conectado ── -->
        <v-alert
          v-if="syncState.isConnected"
          type="success"
          variant="tonal"
          class="mb-4"
          :icon="mdiCloudCheckOutline"
        >
          <div class="text-body-2">
            <strong>Provedor:</strong>
            {{ providerLabel }}
          </div>
          <div v-if="syncState.userAddress" class="text-body-2">
            <strong>Endereço:</strong> {{ syncState.userAddress }}
          </div>
          <div v-if="syncState.lastSyncAt" class="text-body-2">
            <strong>Última sincronização:</strong>
            {{ formatSyncDate(syncState.lastSyncAt) }}
          </div>
        </v-alert>

        <!-- ── Formulário de conexão ── -->
        <template v-if="!syncState.isConnected">
          <!-- Aviso de privacidade (linguagem simples) -->
          <v-alert
            type="info"
            variant="tonal"
            :icon="mdiInformationOutline"
            class="mb-4"
          >
            Seus dados de estudo serão salvos de forma privada e segura nesta
            conta externa, permitindo que você os acesse em outros aparelhos.
          </v-alert>

          <v-text-field
            v-model="userAddressInput"
            label="Seu e-mail do Google (Gmail)"
            placeholder="email@gmail.com"
            :prepend-inner-icon="mdiAccountCircleOutline"
            hint="Use o mesmo e-mail que você já usa no Google Drive."
            persistent-hint
            class="mb-3"
            :disabled="syncState.isConnecting"
            @keyup.enter="handleConnect"
          />

          <v-btn
            color="primary"
            variant="elevated"
            :loading="syncState.isConnecting"
            :prepend-icon="mdiCloudLockOutline"
            :disabled="!userAddressInput.trim()"
            block
            @click="handleConnect"
          >
            Conectar e Autorizar
          </v-btn>
          <p class="text-caption text-medium-emphasis mt-2">
            Ao clicar, você será redirecionado para autorizar o acesso.
            O aplicativo retomará automaticamente após a confirmação.
          </p>
        </template>

        <!-- ── Controles de sincronização (conectado) ── -->
        <template v-if="syncState.isConnected">
          <!-- Auto-sync toggle -->
          <v-switch
            v-model="autoSync"
            color="primary"
            :prepend-icon="mdiCloudRefreshOutline"
            label="Sincronização Automática"
            hint="Envia os dados para a nuvem 5 segundos após cada alteração."
            persistent-hint
            class="mb-4"
          />

          <v-row dense class="mb-4">
            <!-- Sincronizar agora -->
            <v-col cols="12" md="6" class="d-flex align-center">
              <SyncButton block />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-btn
                block
                color="error"
                variant="outlined"
                :prepend-icon="mdiCloudOffOutline"
                @click="handleDisconnect"
              >
                Desconectar
              </v-btn>
            </v-col>
          </v-row>
        </template>

        <!-- ── Alertas de erro / sucesso ── -->
        <v-alert
          v-if="syncState.error"
          type="error"
          variant="tonal"
          class="mt-2"
          closable
          @click:close="clearError"
        >
          {{ syncState.error }}
        </v-alert>


      </v-card-text>
    </v-card>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- 2 · METAS DE ESTUDO                                                -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center pt-5 px-6">
        <v-icon class="mr-2" color="primary" :icon="mdiTarget" />
        Metas de Estudo
      </v-card-title>

      <v-card-text class="px-6">
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
          class="mb-4"
        />
        <v-btn color="primary" variant="elevated" :prepend-icon="mdiContentSave" @click="salvarMeta">
          Salvar Metas
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- 3 · BACKUP DE DADOS                                                -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center pt-5 px-6">
        <v-icon class="mr-2" color="primary" :icon="mdiDatabaseOutline" />
        Backup de Dados
      </v-card-title>

      <v-card-text class="px-6">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Seus dados ficam apenas neste navegador. Use o backup para não perdê-los
          ao trocar de dispositivo.
          <NuxtLink to="/ajuda-backup" class="ml-1">Ver guia completo</NuxtLink>.
        </p>

        <v-row dense>
          <v-col md="6" cols="12">
            <v-btn
              block
              variant="elevated"
              color="primary"
              :prepend-icon="mdiExportVariant"
              @click="store.exportData()"
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
      </v-card-text>
    </v-card>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- 4 · TUTORIAL                                                       -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center pt-5 px-6">
        <v-icon class="mr-2" color="primary" :icon="mdiSchoolOutline" />
        Tutorial
      </v-card-title>
      <v-card-text class="px-6">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Reveja o tour de boas-vindas para conhecer todos os recursos do Equilibra Que Dá!
        </p>
        <v-btn
          variant="outlined"
          color="light"
          :prepend-icon="mdiInformationOutline"
          @click="reiniciarTour"
        >
          Ver tutorial novamente
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- Diálogo de confirmação de restauração de backup                    -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
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

    <!-- Snackbar de meta salva -->
    <v-snackbar v-model="snackMetaSalva" color="success" :timeout="2500">
      Metas atualizadas com sucesso!
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import {
  mdiCogOutline,
  mdiCloudSync,
  mdiCloudOffOutline,
  mdiCloudCheckOutline,
  mdiCloudLockOutline,
  mdiCloudRefreshOutline,
  mdiCheckCircleOutline,
  mdiAccountCircleOutline,
  mdiOpenInNew,
  mdiTarget,
  mdiCalendarToday,
  mdiCalendarWeek,
  mdiContentSave,
  mdiDatabaseOutline,
  mdiExportVariant,
  mdiImport,
  mdiSchoolOutline,
  mdiInformationOutline,
  mdiAlertOutline,
} from '@mdi/js'
import { useDisplay } from 'vuetify'

// ─── Store & composables ─────────────────────────────────────────────────────
const store = useStudyStore()
const { syncState, autoSync, connect, disconnect } = useSync()
const { iniciarTour } = useOnboarding()
const { smAndDown } = useDisplay()

// ─── Sync ────────────────────────────────────────────────────────────────────
const userAddressInput = ref('')

const providerLabel = computed(() => {
  const map: Record<string, string> = {
    remotestorage: 'RemoteStorage',
    dropbox: 'Dropbox',
    googledrive: 'Google Drive',
  }
  return map[syncState.provider ?? ''] ?? syncState.provider ?? 'Desconhecido'
})

function formatSyncDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR')
}

function clearError() {
  // syncState is readonly — only the composable internals can mutate it.
  // We trigger a fresh initRS which resets transient errors on reconnect.
  // For the close button we simply hide the alert via a local flag.
  ;(syncState as any).error = null
}

async function handleConnect() {
  if (!userAddressInput.value.trim()) return
  await connect(userAddressInput.value)
}

function handleDisconnect() {
  disconnect()
}

// ─── Metas ───────────────────────────────────────────────────────────────────
const metaForm = ref({
  dailyTarget: store.goal.dailyTarget,
  weeklyTarget: store.goal.weeklyTarget,
})
const snackMetaSalva = ref(false)

function salvarMeta() {
  store.updateGoal({ ...metaForm.value })
  snackMetaSalva.value = true
}

// ─── Backup ──────────────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingJsonString = ref('')
const dataDoBackup = ref('')
const dialogConfirmacaoRestore = ref(false)

const ultimaAtividadeAtual = computed(() => {
  if (store.sessions.length === 0) return 'Nenhuma atividade'
  const ultima = [...store.sessions].sort((a, b) => b.date.localeCompare(a.date))[0]
  return new Date(ultima.date + 'T12:00:00').toLocaleDateString('pt-BR')
})

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
      dataDoBackup.value = parsed.exportedAt
        ? new Date(parsed.exportedAt).toLocaleDateString('pt-BR')
        : 'Desconhecida'
    }
    catch {
      dataDoBackup.value = 'Arquivo inválido'
    }
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

// ─── Tutorial ────────────────────────────────────────────────────────────────
// The drawer is controlled from default.vue; we request it to open via a
// provide/inject pattern using a shared composable state flag.
const drawerOpen = useState<boolean>('drawer-open', () => false)

function reiniciarTour() {
  nextTick(() => iniciarTour({ openDrawer: () => { drawerOpen.value = true } }))
}
</script>
