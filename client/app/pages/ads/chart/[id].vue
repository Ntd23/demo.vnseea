<!-- English description: Thin route wrapper for the backend-backed ads analytics screen. -->
<template>
  <AdsChartPage :campaign-id="campaignId" />
</template>

<script setup lang="ts">
import AdsChartPage from "../../../../src/ads/presentation/pages/AdsChartPage.vue"
import { appRoutes } from "../../../../src/shared-kernel/application/constants/route-registry"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const adId = computed(() => String(route.params.id ?? ""))
const campaignId = computed(() => Number(adId.value))
const canonicalUrl = computed(() => new URL(appRoutes.adsChart(adId.value), requestURL.origin).toString())

useSeoMeta({
  title: () => t("ads.chart.pageTitle"),
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
