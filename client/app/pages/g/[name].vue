<template>
  <CommunityPresentationGroupDetailPage />
</template>

<script setup lang="ts">
import CommunityPresentationGroupDetailPage from "../../../src/community/presentation/pages/GroupDetailPage.vue"
import { useCommunityGroupDetail } from "../../../src/community/application/composables/useCommunityGroupDetail"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const translateText = useMaybeTranslatedText()

const { group } = useCommunityGroupDetail(
  computed(() => String(route.params.name || "")),
)

const canonicalUrl = computed(() =>
  new URL(`/g/${String(route.params.name || "")}`, requestURL.origin).toString(),
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
