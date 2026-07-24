<!-- English description: Exposes the purchased orders view through Nuxt file-based routing. -->
<template>
  <PagesOrdersPage active-section="purchased" />
</template>

<script setup lang="ts">
import PagesOrdersPage from "../../src/orders/presentation/pages/OrdersPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()

useHead({
  title: t("pages.myProductsPage.purchased"),
})
</script>
