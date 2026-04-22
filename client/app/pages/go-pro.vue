<template>
  <PagesGoProPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: () => t("pages.goProPage.seoTitle"),
})
</script>
