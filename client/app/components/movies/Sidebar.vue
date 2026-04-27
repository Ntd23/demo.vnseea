<template>
  <MoviesPresentationSidebar v-bind="$attrs" />
</template>

<script setup lang="ts">
import MoviesPresentationSidebar from "../../../src/movies/presentation/components/Sidebar.vue"

defineOptions({ inheritAttrs: false })
</script>
