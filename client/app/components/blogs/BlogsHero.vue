<template>
  <BlogsPresentationHero v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationHero from "../../../src/blogs/presentation/components/BlogsHero.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
