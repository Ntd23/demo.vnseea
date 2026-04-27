<template>
  <MoviesRoutePage />
</template>

<script setup lang="ts">
import { useMoviesSeo } from "../../src/movies/application/composables/useMoviesSeo"
import MoviesRoutePage from "../components/pages/MoviesPage.vue"

definePageMeta({
  layout: "default",
})

useMoviesSeo()
</script>
