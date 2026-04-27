<template>
  <PagesReelsPage />
</template>

<script setup lang="ts">
import PagesReelsPage from "../../src/pages/presentation/pages/ReelsPage.vue"
definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
useHead({
  title: () => t('pages.reelsPage.seoTitle'),
})
</script>
