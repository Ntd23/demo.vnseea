<template>
  <BlogsPresentationCreateBlogPage :edit-blog-id="blogId" />
</template>

<script setup lang="ts">
import BlogsPresentationCreateBlogPage from "../../../src/blogs/presentation/pages/CreateBlogPage.vue"

definePageMeta({ layout: "default" })

const route = useRoute()
const blogId = computed(() => Number.parseInt(String(route.params.id ?? ""), 10) || undefined)
</script>
