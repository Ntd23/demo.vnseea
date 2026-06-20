<!-- English description: Thin route wrapper for account verification with branded noindex metadata. -->
<template>
  <AuthConfirmAccountPage />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import AuthConfirmAccountPage from "../../src/auth/presentation/pages/ConfirmAccountPage.vue"
import { useSiteBrandingStore } from "../../src/site-branding/application/stores/useSiteBrandingStore"

definePageMeta({
  layout: "guest",
  middleware: "guest",
})

const route = useRoute()
const requestURL = useRequestURL()
const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const canonicalUrl = computed(() => new URL(route.fullPath || "/confirm-account", requestURL.origin).toString())
const siteName = computed(() => branding.value.siteName || branding.value.siteTitle)
const accountLabel = computed(() => siteName.value ? `your ${siteName.value} account` : "your account")
const seoDescription = computed(() => `Verify ${accountLabel.value} with the confirmation code sent by the backend.`)

useSeoMeta({
  title: "Verify account",
  description: () => seoDescription.value,
  ogTitle: "Verify account",
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  robots: "noindex, nofollow",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>
