<template>
  <BlogsPresentationResultsHeader v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationResultsHeader from "../../../src/blogs/presentation/components/BlogsResultsHeader.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
