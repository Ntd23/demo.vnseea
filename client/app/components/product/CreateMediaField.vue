<template>
  <ProductPresentationCreateMediaField v-bind="$attrs" />
</template>

<script setup lang="ts">
import ProductPresentationCreateMediaField from "../../../src/product/presentation/components/CreateMediaField.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
