<template>
  <PopularPresentationFilters v-bind="$attrs" />
</template>

<script setup lang="ts">
import PopularPresentationFilters from "../../../src/popular/presentation/components/Filters.vue"

defineOptions({ inheritAttrs: false })
</script>
