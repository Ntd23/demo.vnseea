<template>
  <ProductEditProductPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import ProductEditProductPresentationPage from "../../../src/product/presentation/pages/EditProductPage.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
