<template>
  <CommunityPresentationGroupDetailPage />
</template>

<script setup lang="ts">
import CommunityPresentationGroupDetailPage from "../../../src/community/presentation/pages/GroupDetailPage.vue"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const slug = computed(() => String(route.params.name || ""))

const canonicalUrl = computed(() =>
  new URL(appRoutes.groupDetail(slug.value), requestURL.origin).toString(),
)

useSeoMeta({
  title: () => `${t("pages.groupDetailPage.seoFallbackTitle")} | VNSEEA`,
  description: () => t("pages.groupDetailPage.seoFallbackDescription"),
  ogTitle: () => `${t("pages.groupDetailPage.seoFallbackTitle")} | VNSEEA`,
  ogDescription: () => t("pages.groupDetailPage.seoFallbackDescription"),
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
