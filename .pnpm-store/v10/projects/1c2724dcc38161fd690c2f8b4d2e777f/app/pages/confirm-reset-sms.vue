<!-- English description: Thin route wrapper for reset SMS confirmation with branded noindex metadata. -->
<template>
  <AuthConfirmResetSmsPage />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import AuthConfirmResetSmsPage from "../../src/auth/presentation/pages/ConfirmResetSmsPage.vue"
import { useSiteBrandingStore } from "../../src/site-branding/application/stores/useSiteBrandingStore"

definePageMeta({
  layout: "guest",
  middleware: "guest",
})

const route = useRoute()
const requestURL = useRequestURL()
const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const canonicalUrl = computed(() => new URL(route.fullPath || "/confirm-reset-sms", requestURL.origin).toString())
const siteName = computed(() => branding.value.siteName || branding.value.siteTitle)
const accountLabel = computed(() => siteName.value ? `your ${siteName.value} account` : "your account")
const seoDescription = computed(() => `Confirm the phone reset code for ${accountLabel.value}.`)

useSeoMeta({
  title: "Confirm phone reset",
  description: () => seoDescription.value,
  ogTitle: "Confirm phone reset",
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  robots: "noindex, nofollow",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>
