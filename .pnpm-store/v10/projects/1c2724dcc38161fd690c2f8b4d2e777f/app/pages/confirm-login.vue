<!-- English description: Thin route wrapper for login confirmation with branded noindex metadata. -->
<template>
  <AuthConfirmLoginPage />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import AuthConfirmLoginPage from "../../src/auth/presentation/pages/ConfirmLoginPage.vue"
import { useSiteBrandingStore } from "../../src/site-branding/application/stores/useSiteBrandingStore"

definePageMeta({
  layout: "guest",
  middleware: "guest",
})

const route = useRoute()
const requestURL = useRequestURL()
const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const canonicalUrl = computed(() => new URL(route.fullPath || "/confirm-login", requestURL.origin).toString())
const siteName = computed(() => branding.value.siteName || branding.value.siteTitle)
const accountLabel = computed(() => siteName.value ? `your ${siteName.value} account` : "your account")
const seoDescription = computed(() => `Confirm the sign-in code for ${accountLabel.value}.`)

useSeoMeta({
  title: "Confirm sign in",
  description: () => seoDescription.value,
  ogTitle: "Confirm sign in",
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  robots: "noindex, nofollow",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>
