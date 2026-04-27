<template>
  <MoviesPresentationHero v-bind="$attrs" />
</template>

<script setup lang="ts">
import MoviesPresentationHero from "../../../src/movies/presentation/components/Hero.vue"

defineOptions({ inheritAttrs: false })
</script>
