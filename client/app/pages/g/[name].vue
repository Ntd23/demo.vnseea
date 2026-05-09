<template>
  <CommunityPresentationGroupDetailPage />
</template>

<script setup lang="ts">
import CommunityPresentationGroupDetailPage from "../../../src/community/presentation/pages/GroupDetailPage.vue"
import { useCommunityGroupDetailPageVM } from "../../../src/community/application/view-models/useCommunityGroupDetailPageVM"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const requestURL = useRequestURL()
const translateText = useMaybeTranslatedText()

const { group, slug } = useCommunityGroupDetailPageVM()

const canonicalUrl = computed(() =>
  new URL(`/g/${slug.value}`, requestURL.origin).toString(),
)

const metaTitle = computed(() => {
  const groupName = group.value ? translateText(group.value.name) : ""
  return `${groupName || t("pages.groupDetailPage.seoFallbackTitle")} | VNSEEA`
})

const metaDescription = computed(() =>
  group.value
    ? translateText(group.value.summary, t("pages.groupDetailPage.seoFallbackDescription"))
    : t("pages.groupDetailPage.seoFallbackDescription"),
)

useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  ogTitle: () => metaTitle.value,
  ogDescription: () => metaDescription.value,
  ogUrl: () => canonicalUrl.value,
  robots: () => group.value ? "index, follow" : "noindex, nofollow",
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
