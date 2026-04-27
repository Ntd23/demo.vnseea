<template>
  <BlogsPresentationCreateHero v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationCreateHero from "../../../src/blogs/presentation/components/CreateBlogHero.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
