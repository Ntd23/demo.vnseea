<!-- English description: Thin guest login route wrapper with noindex metadata and sanitized canonical URL. -->
<template>
  <PagesWelcomePage />
</template>

<script setup lang="ts">
import PagesWelcomePage from "../../src/pages/presentation/pages/WelcomePage.vue"
definePageMeta({
  layout: "guest",
  middleware: "guest",
})

const { t } = useI18n()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL('/welcome', requestURL.origin).toString())

useSeoMeta({
  title: () => t('pages.welcomePage.seoTitle'),
  description: () => t('pages.welcomePage.seoDescription'),
  ogTitle: () => t('pages.welcomePage.seoTitle'),
  ogDescription: () => t('pages.welcomePage.seoDescription'),
  ogUrl: () => canonicalUrl.value,
  robots: 'index, follow',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
})
</script>
