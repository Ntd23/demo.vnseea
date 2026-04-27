<template>
  <PagesSavedPostsPage />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: "default",
})

useHead({
  title: () => t("pages.savedPostsPage.seoTitle"),
})
</script>
