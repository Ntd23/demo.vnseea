<template>
  <PagesSearchPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: computed(() => t('community.search.seoTitle')),
})
</script>
