<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<style>
/* No app.vue ou assets/css/main.css */
@import 'driver.js/dist/driver.css';

:root {
  --driver-color-main: #356854; /* Cor Primary do IFRN */
}

.equilibra-popover {
  background-color: #434343 !important; /* Surface Dark */
  color: #f3f3f3 !important;
  border: 1px solid #5a5a5a !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
}

.equilibra-popover .driver-popover-title {
  color: #f3f3f3 !important;
  font-size: 1.1rem !important;
}

.equilibra-popover .driver-popover-description {
  color: #e0e0e0 !important;
  line-height: 1.5 !important;
}

/* Botões do Tutorial */
.equilibra-popover .driver-popover-footer button {
  background-color: #356854 !important;
  color: white !important;
  border: none !important;
  text-shadow: none !important;
  font-weight: bold !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
}

.equilibra-popover .driver-popover-footer .driver-popover-prev-btn {
  background-color: transparent !important;
  border: 1px solid #5a5a5a !important;
}

/* Seta do Popover */
.equilibra-popover .driver-popover-arrow {
  border-color: #434343 !important;
}
</style>
