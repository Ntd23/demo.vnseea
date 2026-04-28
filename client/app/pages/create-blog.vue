<template>
  <BlogsPresentationCreateBlogPage />
</template>

<script setup lang="ts">
import BlogsPresentationCreateBlogPage from "../../src/blogs/presentation/pages/CreateBlogPage.vue"
definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/create-blog", requestURL.origin).toString())

useSeoMeta({
  title: () => t("pages.createBlogPage.seoTitle"),
  description: () => t("pages.createBlogPage.seoDescription"),
  ogTitle: () => t("pages.createBlogPage.seoTitle"),
  ogDescription: () => t("pages.createBlogPage.seoDescription"),
  ogUrl: () => canonicalUrl.value,
  robots: "noindex, nofollow",
})

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
})
</script>
