<!-- English description: Thin Nuxt route wrapper for the backend-backed offers directory route. -->
<template>
  <OfferPresentationOffersPage />
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import OfferPresentationOffersPage from "../../src/offer/presentation/pages/OffersPage.vue"

definePageMeta({
  layout: "default",
  publicContent: true,
})

const { t } = useI18n()
const requestURL = useRequestURL()
const canonicalUrl = computed(() => new URL(appRoutes.offers, requestURL.origin).toString())

useSeoMeta({
  title: () => t("offers.seoTitle"),
  description: () => t("offers.seoDescription"),
  ogTitle: () => t("offers.seoTitle"),
  ogDescription: () => t("offers.seoDescription"),
  ogUrl: () => canonicalUrl.value,
  robots: "index, follow",
})

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl.value,
    },
  ],
})
</script>
