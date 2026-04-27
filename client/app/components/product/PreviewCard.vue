<template>
  <ProductPresentationPreviewCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import ProductPresentationPreviewCard from "../../../src/product/presentation/components/PreviewCard.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
