<template>
  <ProductPresentationProductDetailPage :product-id="productId" />
</template>

<script setup lang="ts">
import ProductPresentationProductDetailPage from "../../../src/product/presentation/pages/ProductDetailPage.vue"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const productId = computed(() => String(route.params.id ?? ""))
</script>
