<template>
  <MoviesPresentationCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import MoviesPresentationCard from "../../../src/movies/presentation/components/Card.vue"

defineOptions({ inheritAttrs: false })
</script>
