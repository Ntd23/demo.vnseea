<template>
  <BlogsPresentationCreateSidebar v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationCreateSidebar from "../../../src/blogs/presentation/components/CreateBlogSidebar.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
