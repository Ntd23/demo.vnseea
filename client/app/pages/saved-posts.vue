<template>
  <PagesSavedPostsPage />
</template>

<script setup lang="ts">
import PagesSavedPostsPage from "../../src/pages/presentation/pages/SavedPostsPage.vue"
const { t } = useI18n()

definePageMeta({
  layout: "default",
})

useHead({
  title: () => t("pages.savedPostsPage.seoTitle"),
})
</script>
