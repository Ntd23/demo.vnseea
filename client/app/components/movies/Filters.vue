<template>
  <MoviesPresentationFilters v-bind="$attrs" />
</template>

<script setup lang="ts">
import MoviesPresentationFilters from "../../../src/movies/presentation/components/Filters.vue"

defineOptions({ inheritAttrs: false })
</script>
