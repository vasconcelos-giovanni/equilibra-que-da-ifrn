<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-1">
      <v-icon class="mr-2" color="primary" :icon="mdiPlusCircleOutline" />
      Registrar Sessão de Estudo
    </h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-6">
      Preencha os dados da sua sessão de resolução de questões
    </p>

    <SessionForm
      :edit-id="editId"
      @success="onSuccess"
      @cancel="onCancel"
    />

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
import { mdiPlusCircleOutline, mdiCheckCircle } from '@mdi/js'

const route = useRoute()
const router = useRouter()

const snackbar = ref(false)
const snackbarMsg = ref('')

const editId = computed(() => route.query.editar as string | undefined)

function onSuccess(message: string) {
  snackbarMsg.value = message
  snackbar.value = true
  if (route.query.editar) {
    router.replace({ query: {} })
  }
}

function onCancel() {
  router.replace({ query: {} })
}
</script>

