<template>
  <PagesWatchPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t: translate } = useI18n()

useHead({
  title: () => translate("pages.watchPage.seoTitle"),
})
</script>
