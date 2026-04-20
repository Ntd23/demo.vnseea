<template>
  <PagesCheckoutPage />
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: "default",
})

useHead({
  title: `${t("checkout.page.title")}`,
})
</script>
