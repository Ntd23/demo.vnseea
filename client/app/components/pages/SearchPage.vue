<template>
  <SearchPresentationSearchPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import SearchPresentationSearchPage from "../../../src/search/presentation/pages/SearchPage.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
