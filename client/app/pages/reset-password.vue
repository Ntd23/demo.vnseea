<!-- English description: Thin route wrapper for password reset with branded noindex metadata. -->
<template>
  <AuthResetPasswordPage />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import AuthResetPasswordPage from "../../src/auth/presentation/pages/ResetPasswordPage.vue"
import { useSiteBrandingStore } from "../../src/site-branding/application/stores/useSiteBrandingStore"

definePageMeta({
  layout: "guest",
  middleware: "guest",
})

const route = useRoute()
const requestURL = useRequestURL()
const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const canonicalUrl = computed(() => new URL(route.fullPath || "/reset-password", requestURL.origin).toString())
const siteName = computed(() => branding.value.siteName || branding.value.siteTitle)
const accountLabel = computed(() => siteName.value ? `your ${siteName.value} account` : "your account")
const seoDescription = computed(() => `Set a new password for ${accountLabel.value}.`)

useSeoMeta({
  title: "Reset password",
  description: () => seoDescription.value,
  ogTitle: "Reset password",
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  robots: "noindex, nofollow",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>
