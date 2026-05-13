<template>
  <BlogsPresentationReadBlogPage />
</template>

<script setup lang="ts">
import BlogsPresentationReadBlogPage from "../../../src/blogs/presentation/pages/ReadBlogPage.vue"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const requestURL = useRequestURL()
const { t } = useI18n()

const currentSlug = computed(() => String(route.params.slug ?? ""))
const canonicalUrl = computed(() => new URL(appRoutes.readBlog(currentSlug.value), requestURL.origin).toString())

useSeoMeta({
  title: () => `${t("pages.readBlogPage.notFound")} | VNSEEA`,
  description: () => t("pages.readBlogPage.notFoundDescription"),
  ogTitle: () => `${t("pages.readBlogPage.notFound")} | VNSEEA`,
  ogDescription: () => t("pages.readBlogPage.notFoundDescription"),
  ogUrl: () => canonicalUrl.value,
  ogType: "article",
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
