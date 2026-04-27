<template>
  <BlogsPresentationPagination v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationPagination from "../../../src/blogs/presentation/components/BlogsPagination.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
