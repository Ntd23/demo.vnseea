<!-- English description: Thin Nuxt route wrapper for the backend-backed movie detail page. -->
<template>
  <MoviesPresentationMovieDetailPage />
</template>

<script setup lang="ts">
import MoviesPresentationMovieDetailPage from "../../../../src/movies/presentation/pages/MovieDetailPage.vue";

definePageMeta({
  layout: "default",
});
</script>
