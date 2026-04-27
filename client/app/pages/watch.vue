<template>
  <PagesWatchPage />
</template>

<script setup lang="ts">
import PagesWatchPage from "../../src/pages/presentation/pages/WatchPage.vue"
definePageMeta({
  layout: "default",
})

const { t: translate } = useI18n()

useHead({
  title: () => translate("pages.watchPage.seoTitle"),
})
</script>
