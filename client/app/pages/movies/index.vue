<!-- English description: Routes the movie catalog to the bounded-context presentation page. -->
<template>
  <MoviesPresentationMoviesPage />
</template>

<script setup lang="ts">
import MoviesPresentationMoviesPage from "../../../src/movies/presentation/pages/MoviesPage.vue";

definePageMeta({
  layout: "default",
});
</script>
