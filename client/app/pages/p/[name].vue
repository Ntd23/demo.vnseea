<template>
  <CommunityPresentationPageDetailPage />
</template>

<script setup lang="ts">
import CommunityPresentationPageDetailPage from "../../../src/community/presentation/pages/PageDetailPage.vue"
import { useCommunityPageDetail } from "../../../src/community/application/composables/useCommunityPageDetail"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const translateText = useMaybeTranslatedText()

const { page } = useCommunityPageDetail(
  computed(() => String(route.params.name || "")),
  computed(() => route.query),
)

const canonicalUrl = computed(() =>
  new URL(`/p/${String(route.params.name || "")}`, requestURL.origin).toString(),
)

const hasPreviewQuery = computed(() =>
  ["name", "description", "category"].some(key => {
    const value = route.query[key]
    if (Array.isArray(value)) return String(value[0] || "").trim().length > 0
    return typeof value === "string" && value.trim().length > 0
  }),
)

const metaTitle = computed(() => {
  const pageName = page.value ? translateText(page.value.name) : ""
  return `${pageName || t("pages.pageDetailPage.seoFallbackTitle")} | VNSEEA`
})

const metaDescription = computed(() =>
  page.value
    ? translateText(page.value.summary, t("pages.pageDetailPage.seoFallbackDescription"))
    : t("pages.pageDetailPage.seoFallbackDescription"),
)

useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  ogTitle: () => metaTitle.value,
  ogDescription: () => metaDescription.value,
  ogUrl: () => canonicalUrl.value,
  robots: () => (!page.value || hasPreviewQuery.value) ? "noindex, nofollow" : "index, follow",
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
