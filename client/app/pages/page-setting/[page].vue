<template>
  <CommunityPresentationPageSettingPage />
</template>

<script setup lang="ts">
import CommunityPresentationPageSettingPage from "../../../src/community/presentation/pages/PageSettingPage.vue"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const { page } = useCommunityPageDetail(computed(() => String(route.params.page || "")))

const canonicalUrl = computed(() => {
  const slug = String(route.params.page || "")
  return new URL(route.fullPath || `/page-setting/${slug}`, requestURL.origin).toString()
})

useSeoMeta({
  title: () =>
    page.value
      ? t("community.pageSettings.seoTitle", { name: t(page.value.name) })
      : t("community.pageSettings.seoTitleFallback"),
  description: () =>
    page.value ? page.value.summary : t("community.pageSettings.seoDescFallback"),
  ogTitle: () =>
    page.value
      ? t("community.pageSettings.seoTitle", { name: t(page.value.name) })
      : t("community.pageSettings.seoTitleFallback"),
  ogDescription: () =>
    page.value ? page.value.summary : t("community.pageSettings.seoDescFallback"),
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
