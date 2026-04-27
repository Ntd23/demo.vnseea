<template>
  <CommunityPresentationPagesDirectoryPage />
</template>

<script setup lang="ts">
import CommunityPresentationPagesDirectoryPage from "../../src/community/presentation/pages/PagesDirectoryPage.vue"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/pages", requestURL.origin).toString())

useSeoMeta({
  title: () => `${t("community.pagesDirectory.seoMineTitle")} | VNSEEA`,
  description: () => t("community.pagesDirectory.seoMineDesc"),
  ogTitle: () => `${t("community.pagesDirectory.seoMineTitle")} | VNSEEA`,
  ogDescription: () => t("community.pagesDirectory.seoMineDesc"),
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
