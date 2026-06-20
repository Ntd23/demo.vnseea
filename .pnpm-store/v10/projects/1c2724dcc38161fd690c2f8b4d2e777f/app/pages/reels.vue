<!-- English description: Nuxt route wrapper for the authenticated reels viewer using the shared app layout. -->
<template>
  <ReelsPresentationReelsPage />
</template>

<script setup lang="ts">
import ReelsPresentationReelsPage from "../../src/reels/presentation/pages/ReelsPage.vue"
definePageMeta({
  layout: "default",
})

const { t } = useI18n()
useHead({
  title: () => t('pages.reelsPage.seoTitle'),
})
</script>
