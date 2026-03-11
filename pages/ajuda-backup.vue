<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-1">
      <v-icon class="mr-2" color="primary" :icon="mdiHelpCircleOutline" />
      Como salvar e mover meus dados?
    </h1>
    <p class="text-subtitle-1 text-medium-emphasis mb-8">
      Guia completo de backup e restauração do seu progresso
    </p>

    <!-- O que é isso? -->
    <v-card color="surface" class="mb-6 pa-6">
      <div class="d-flex align-center mb-3">
        <v-icon color="info" class="mr-2" :icon="mdiInformationOutline" />
        <span class="text-h6 font-weight-bold">O que é isso?</span>
      </div>
      <p class="text-body-1">
        Como o <strong>Equilibra Que Dá</strong> não pede conta nem senha, seus dados ficam guardados
        apenas <strong>neste navegador</strong>, neste dispositivo. Se você formatar o celular,
        mudar de computador ou limpar o histórico do navegador, pode perder tudo.
      </p>
      <p class="text-body-1 mt-3">
        O <strong>Backup</strong> serve para você salvar uma cópia de segurança externa — um arquivo no seu
        celular, pen drive ou na nuvem (Google Drive, por exemplo) — e depois restaurar quando precisar.
      </p>
    </v-card>

    <v-row>
      <!-- Como salvar (Backup) -->
      <v-col cols="12" md="6">
        <v-card color="surface" class="pa-6" height="100%">
          <div class="d-flex align-center mb-4">
            <v-avatar color="primary" size="40" class="mr-3">
              <v-icon :icon="mdiExportVariant" />
            </v-avatar>
            <span class="text-h6 font-weight-bold">Como salvar (Backup)</span>
          </div>

          <v-timeline density="compact" side="end">
            <v-timeline-item
              dot-color="primary"
              size="small"
            >
              <div class="text-body-1">
                Vá em <strong>Configurações</strong>
                <v-icon size="16" class="mx-1" :icon="mdiCogOutline" />
                (menu lateral, embaixo).
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="primary"
              size="small"
            >
              <div class="text-body-1">
                Clique no botão <strong>"Baixar dados"</strong>.
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="primary"
              size="small"
            >
              <div class="text-body-1">
                Um arquivo <code>.json</code> será salvo no seu dispositivo.
                Guarde-o bem — no Google Drive, WhatsApp para si mesmo, ou num pen drive.
              </div>
            </v-timeline-item>
          </v-timeline>

          <v-alert
            type="success"
            variant="tonal"
            class="mt-4"
            :icon="mdiLightbulbOutline"
          >
            Faça backup toda vez que terminar uma rodada de estudos importante!
          </v-alert>
        </v-card>
      </v-col>

      <!-- Como restaurar -->
      <v-col cols="12" md="6">
        <v-card color="surface" class="pa-6" height="100%">
          <div class="d-flex align-center mb-4">
            <v-avatar color="secondary" size="40" class="mr-3">
              <v-icon :icon="mdiImport" />
            </v-avatar>
            <span class="text-h6 font-weight-bold">Como levar para outro dispositivo (Restaurar)</span>
          </div>

          <v-timeline density="compact" side="end">
            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-body-1">
                No <strong>novo dispositivo</strong>, abra o site normalmente.
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-body-1">
                Acesse <strong>Configurações</strong>
                <v-icon size="16" class="mx-1" :icon="mdiCogOutline" />
                e clique em <strong>"Restaurar dados"</strong>.
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-body-1">
                Selecione o arquivo <code>.json</code> que você salvou anteriormente.
              </div>
            </v-timeline-item>

            <v-timeline-item
              dot-color="secondary"
              size="small"
            >
              <div class="text-body-1">
                Confirme na tela de revisão. O site vai atualizar e pronto —
                seu progresso estará lá!
              </div>
            </v-timeline-item>
          </v-timeline>

          <v-alert
            type="warning"
            variant="tonal"
            class="mt-4"
            :icon="mdiAlertOutline"
          >
            Restaurar substitui os dados atuais. Faça um backup antes se quiser manter o histórico de ambos os dispositivos.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <!-- Perguntas frequentes -->
    <v-card color="surface" class="mt-6 pa-6">
      <div class="d-flex align-center mb-4">
        <v-icon color="warning" class="mr-2" :icon="mdiFrequentlyAskedQuestions" />
        <span class="text-h6 font-weight-bold">Perguntas Frequentes</span>
      </div>

      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          title="O que acontece se eu limpar o cache do navegador?"
          text="Seus dados serão apagados, pois ficam armazenados no seu navegador de internet (como o Google Chrome). Por isso é importante fazer backup regularmente."
        />
        <v-expansion-panel
          title="O arquivo de backup é seguro?"
          text="Sim. Ele é um arquivo de texto simples (.json) que contém apenas suas sessões de estudo e metas. Não há senhas, dados pessoais ou informações sensíveis."
        />
        <v-expansion-panel
          title="Posso usar o mesmo backup em mais de um dispositivo?"
          text="Sim, mas lembre-se: ao restaurar, os dados existentes naquele dispositivo serão substituídos. Se quiser manter históricos separados, faça backups individuais de cada um antes."
        />
        <v-expansion-panel
          title="Deu erro ao tentar restaurar. O que fazer?"
          text="Verifique se o arquivo selecionado é um backup gerado pelo Equilibra Que Dá. Arquivos modificados manualmente ou de versões muito antigas podem não ser reconhecidos."
        />
      </v-expansion-panels>
    </v-card>

    <!-- Botão de voltar -->
    <div class="d-flex justify-center mt-8">
      <v-btn
        color="primary"
        variant="elevated"
        :prepend-icon="mdiArrowLeft"
        to="/"
      >
        Voltar ao Painel
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  mdiHelpCircleOutline,
  mdiInformationOutline,
  mdiExportVariant,
  mdiImport,
  mdiCogOutline,
  mdiLightbulbOutline,
  mdiAlertOutline,
  mdiFrequentlyAskedQuestions,
  mdiArrowLeft,
} from '@mdi/js'

useHead({ title: 'Ajuda — Backup e Restauração | Equilibra Que Dá!' })
</script>
