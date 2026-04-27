<template>
  <PagesMemoriesPage />
</template>

<script setup lang="ts">
import PagesMemoriesPage from "../../src/pages/presentation/pages/MemoriesPage.vue"
definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: () => t("pages.memoriesPage.seoTitle"),
})
</script>
