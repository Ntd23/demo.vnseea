<template>
  <SavedPresentationSavedPostsPage />
</template>

<script setup lang="ts">
import SavedPresentationSavedPostsPage from "../../src/saved/presentation/pages/SavedPostsPage.vue"
const { t } = useI18n()

definePageMeta({
  layout: "default",
})

useHead({
  title: () => t("pages.savedPostsPage.seoTitle"),
})
</script>
