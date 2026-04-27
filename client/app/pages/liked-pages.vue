<template>
  <CommunityPresentationPagesDirectoryPage mode="favorite" />
</template>

<script setup lang="ts">
import CommunityPresentationPagesDirectoryPage from "../../src/community/presentation/pages/PagesDirectoryPage.vue"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/liked-pages", requestURL.origin).toString())

useSeoMeta({
  title: () => `${t("community.pagesDirectory.seoFavoriteTitle")} | VNSEEA`,
  description: () => t("community.pagesDirectory.seoFavoriteDesc"),
  ogTitle: () => `${t("community.pagesDirectory.seoFavoriteTitle")} | VNSEEA`,
  ogDescription: () => t("community.pagesDirectory.seoFavoriteDesc"),
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
