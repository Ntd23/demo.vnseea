<template>
  <BlogsPresentationReadHero v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationReadHero from "../../../src/blogs/presentation/components/ReadBlogHero.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
