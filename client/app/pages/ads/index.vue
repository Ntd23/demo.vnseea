<!-- English description: Thin route wrapper for the backend-backed ads manager page. -->
<template>
  <AdsPresentationAdsPage />
</template>

<script setup lang="ts">
import AdsPresentationAdsPage from "../../../src/ads/presentation/pages/AdsPage.vue"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const requestURL = useRequestURL()
const canonicalUrl = computed(() => new URL(appRoutes.ads, requestURL.origin).toString())

useSeoMeta({
  title: () => t("navigation.mobileMenu.mainNav.advertising"),
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
