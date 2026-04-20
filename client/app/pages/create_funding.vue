<template>
  <PagesCreateFundingPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: () => t("pages.createFundingPage.seoTitle"),
})
</script>
