<template>
  <BlogsRoutePage />
</template>

<script setup lang="ts">
import BlogsRoutePage from "../components/pages/BlogsPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/blogs", requestURL.origin).toString())

useSeoMeta({
  title: () => t("pages.blogsPage.seoTitle"),
  description: () => t("pages.blogsPage.seoDescription"),
  ogTitle: () => t("pages.blogsPage.seoTitle"),
  ogDescription: () => t("pages.blogsPage.seoDescription"),
  ogUrl: () => canonicalUrl.value,
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
