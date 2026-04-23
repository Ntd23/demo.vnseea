<template>
  <PagesCreateFundingPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const requestURL = useRequestURL()

const seoTitle = computed(() => t("pages.createFundingPage.seoTitle"))
const seoDescription = computed(() => t("pages.createFundingPage.seoDescription"))
const canonicalUrl = computed(() =>
  new URL("/create_funding", requestURL.origin).toString(),
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
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
