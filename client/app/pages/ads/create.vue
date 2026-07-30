<!-- English description: Thin route wrapper for the backend-backed ads creation form. -->
<template>
  <AdsFormPage mode="create" />
</template>

<script setup lang="ts">
import AdsFormPage from "../../../src/ads/presentation/pages/AdsFormPage.vue"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const requestURL = useRequestURL()
const canonicalUrl = computed(() => new URL(appRoutes.adsCreate, requestURL.origin).toString())

useSeoMeta({
  title: () => t("ads.form.createTitle"),
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
