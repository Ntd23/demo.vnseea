<template>
  <PagesCreatePagePage />
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/create-page", requestURL.origin).toString())

useSeoMeta({
  title: () => `${t("community.creation.page.seoTitle")} | VNSEEA`,
  description: () => t("community.creation.page.seoDesc"),
  ogTitle: () => `${t("community.creation.page.seoTitle")} | VNSEEA`,
  ogDescription: () => t("community.creation.page.seoDesc"),
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
