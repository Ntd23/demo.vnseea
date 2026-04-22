<template>
  <PagesOrdersPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: t("orders.page.title"),
})
</script>
