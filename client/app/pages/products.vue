<!-- Description: Thin Nuxt route wrapper for the public products marketplace page. -->
<template>
  <ProductPresentationProductsPage />
</template>

<script setup lang="ts">
import ProductPresentationProductsPage from "../../src/product/presentation/pages/ProductsPage.vue"

definePageMeta({
  layout: "default",
  publicContent: true,
})

const { t } = useI18n()
useHead({
  title: () => t("pages.productsPage.seoTitle"),
})
</script>
