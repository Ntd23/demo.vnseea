<template>
  <PagesReadBlogPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const route = useRoute()
const requestURL = useRequestURL()
const { t } = useI18n()
const { articles } = useMockReadBlogData()

const currentSlug = computed(() => String(route.params.slug ?? ""))
const article = computed(() =>
  articles.value.find(item => item.slug === currentSlug.value) ?? articles.value[0],
)
const articleNotFound = computed(() =>
  !articles.value.some(item => item.slug === currentSlug.value),
)
const canonicalUrl = computed(() => new URL(route.fullPath || `/read-blog/${currentSlug.value}`, requestURL.origin).toString())
const seoTitle = computed(() =>
  articleNotFound.value ? `${t("pages.readBlogPage.notFound")} | VNSEEA` : `${article.value.title} | VNSEEA`,
)
const seoDescription = computed(() =>
  articleNotFound.value ? t("pages.readBlogPage.notFoundDescription") : article.value.excerpt,
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => article.value.image,
  ogType: "article",
  robots: () => articleNotFound.value ? "noindex, nofollow" : "index, follow",
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
