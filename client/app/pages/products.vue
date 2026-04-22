<template>
  <PagesProductsPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()
useHead({
  title: () => t("pages.productsPage.seoTitle"),
})
</script>
