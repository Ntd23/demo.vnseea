<template>
  <SearchRoutePage />
</template>

<script setup lang="ts">
import SearchRoutePage from "../components/pages/SearchPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: () => t("community.search.seoTitle"),
})
</script>
