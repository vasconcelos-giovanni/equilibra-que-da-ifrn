<template>
  <v-layout>
    <v-app-bar flat color="primary-darken-1" density="comfortable">
      <template #prepend>
        <v-app-bar-nav-icon variant="text" @click="drawer = !drawer" />
      </template>

      <v-toolbar-title class="font-weight-bold">
        <v-icon class="mr-2">mdi-school</v-icon>
        <span>Equilibra Que Dá!</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      :temporary="smAndDown"
      :permanent="mdAndUp"
      :model-value="drawer || mdAndUp"
      :expand-on-hover="mdAndUp"
      :rail="!drawer && mdAndUp"
      color="surface"
      rail-width="70"
      elevation="10"
      :width="280"
    >
      <v-list density="compact" class="mt-2">
        <v-list-item
          prepend-icon="mdi-school"
          title="Radar do ENEM"
          subtitle="Controle de Questões"
          class="mb-2"
        />
      </v-list>

      <v-divider />

      <v-list density="comfortable" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.path"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.path"
          rounded="lg"
          class="my-1"
          active-color="primary"
        />
      </v-list>

      <template #append>
        <v-list density="compact" nav class="mb-2">
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Configurar Meta"
            rounded="lg"
            @click="dialogMeta = true"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container :class="{ 'px-8': mdAndUp, 'px-4': smAndDown }" class="py-6">
        <slot />
      </v-container>

      <v-footer border class="py-4 mt-10 flex-grow-0">
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
                IFRN - Campus Nova Cruz
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

    <!-- Diálogo de configuração de meta -->
    <v-dialog v-model="dialogMeta" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-target</v-icon>
          Configurar Metas
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model.number="metaForm.dailyTarget"
            label="Meta diária (questões)"
            type="number"
            prepend-inner-icon="mdi-calendar-today"
            :min="1"
            class="mb-4"
          />

          <v-text-field
            v-model.number="metaForm.weeklyTarget"
            label="Meta semanal (questões)"
            type="number"
            prepend-inner-icon="mdi-calendar-week"
            :min="1"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogMeta = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="salvarMeta">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mdAndUp, smAndDown } = useDisplay()
const drawer = ref(false)
const dialogMeta = ref(false)

const store = useStudyStore()

const metaForm = ref({
  dailyTarget: store.goal.dailyTarget,
  weeklyTarget: store.goal.weeklyTarget,
})

const menuItems = [
  { title: 'Painel', icon: 'mdi-view-dashboard', path: '/' },
  { title: 'Registrar', icon: 'mdi-plus-circle-outline', path: '/registrar' },
  { title: 'Histórico', icon: 'mdi-history', path: '/historico' },
]

function salvarMeta() {
  store.updateGoal({
    dailyTarget: metaForm.value.dailyTarget || 30,
    weeklyTarget: metaForm.value.weeklyTarget || 150,
  })
  dialogMeta.value = false
}
</script>
