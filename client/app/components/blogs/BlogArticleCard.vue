<template>
  <BlogsPresentationBlogArticleCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import BlogsPresentationBlogArticleCard from "../../../src/blogs/presentation/components/BlogArticleCard.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
