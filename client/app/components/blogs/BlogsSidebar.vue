<template>
  <BlogsPresentationSidebar v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationSidebar from "../../../src/blogs/presentation/components/BlogsSidebar.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
