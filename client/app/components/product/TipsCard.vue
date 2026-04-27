<template>
  <ProductPresentationTipsCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import ProductPresentationTipsCard from "../../../src/product/presentation/components/TipsCard.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
