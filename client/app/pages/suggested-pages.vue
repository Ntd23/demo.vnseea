<template>
  <CommunityPresentationPagesDirectoryPage mode="suggested" />
</template>

<script setup lang="ts">
import CommunityPresentationPagesDirectoryPage from "../../src/community/presentation/pages/PagesDirectoryPage.vue"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/suggested-pages", requestURL.origin).toString())

useSeoMeta({
  title: () => `${t("community.pagesDirectory.seoSuggestedTitle")} | VNSEEA`,
  description: () => t("community.pagesDirectory.seoSuggestedDesc"),
  ogTitle: () => `${t("community.pagesDirectory.seoSuggestedTitle")} | VNSEEA`,
  ogDescription: () => t("community.pagesDirectory.seoSuggestedDesc"),
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
