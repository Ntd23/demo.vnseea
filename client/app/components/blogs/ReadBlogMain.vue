<template>
  <BlogsPresentationReadMain v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationReadMain from "../../../src/blogs/presentation/components/ReadBlogMain.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
