<!-- English description: Thin route wrapper for the backend-backed ads editing form. -->
<template>
  <AdsFormPage mode="edit" :campaign-id="campaignId" />
</template>

<script setup lang="ts">
import AdsFormPage from "../../../../src/ads/presentation/pages/AdsFormPage.vue"
import { appRoutes } from "../../../../src/shared-kernel/application/constants/route-registry"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const requestURL = useRequestURL()
const adId = computed(() => String(route.params.id ?? ""))
const campaignId = computed(() => Number(adId.value))
const canonicalUrl = computed(() => new URL(appRoutes.adsEdit(adId.value), requestURL.origin).toString())

useSeoMeta({
  title: "Sửa quảng cáo",
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
