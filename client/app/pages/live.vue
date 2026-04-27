<template>
  <PagesLivePage />
</template>

<script setup lang="ts">
import PagesLivePage from "../../src/live/presentation/pages/LivePage.vue"
definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: () => t("pages.livePage.seoTitle"),
})
</script>
