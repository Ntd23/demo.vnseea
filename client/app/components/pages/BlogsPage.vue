<template>
  <BlogsPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationPage from "../../../src/blogs/presentation/pages/BlogsPage.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
