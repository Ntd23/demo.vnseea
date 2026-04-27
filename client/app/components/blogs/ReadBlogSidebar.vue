<template>
  <BlogsPresentationReadSidebar v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationReadSidebar from "../../../src/blogs/presentation/components/ReadBlogSidebar.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
