<template>
  <BlogsPresentationEmptyState v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationEmptyState from "../../../src/blogs/presentation/components/BlogsEmptyState.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
