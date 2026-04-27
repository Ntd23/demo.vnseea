<template>
  <ProductPresentationHeroBanner v-bind="$attrs" />
</template>

<script setup lang="ts">
import ProductPresentationHeroBanner from "../../../src/product/presentation/components/HeroBanner.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
