<template>
  <SearchPresentationFiltersPanel v-bind="$attrs" />
</template>

<script setup lang="ts">
import SearchPresentationFiltersPanel from "../../../src/search/presentation/components/FiltersPanel.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
