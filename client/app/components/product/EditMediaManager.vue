<template>
  <ProductPresentationEditMediaManager v-bind="$attrs" />
</template>

<script setup lang="ts">
import ProductPresentationEditMediaManager from "../../../src/product/presentation/components/EditMediaManager.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
