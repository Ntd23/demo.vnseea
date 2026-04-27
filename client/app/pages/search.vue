<template>
  <PagesSearchPage />
</template>

<script setup lang="ts">
import PagesSearchPage from "../../src/pages/presentation/pages/SearchPage.vue"
definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: computed(() => t('community.search.seoTitle')),
})
</script>
