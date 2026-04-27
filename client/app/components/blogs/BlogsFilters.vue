<template>
  <BlogsPresentationFilters v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationFilters from "../../../src/blogs/presentation/components/BlogsFilters.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
