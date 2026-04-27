<template>
  <MoviesPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import MoviesPresentationPage from "../../../src/movies/presentation/pages/MoviesPage.vue"

defineOptions({ inheritAttrs: false })
</script>
