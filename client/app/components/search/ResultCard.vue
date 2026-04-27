<template>
  <SearchPresentationResultCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import SearchPresentationResultCard from "../../../src/search/presentation/components/ResultCard.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
