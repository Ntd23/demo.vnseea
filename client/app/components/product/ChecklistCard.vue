<template>
  <ProductPresentationChecklistCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import ProductPresentationChecklistCard from "../../../src/product/presentation/components/ChecklistCard.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
