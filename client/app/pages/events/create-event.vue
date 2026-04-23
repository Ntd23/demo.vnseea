<template>
  <PagesCreateEventPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const requestURL = useRequestURL()

const canonicalUrl = computed(() =>
  new URL("/events/create-event", requestURL.origin).toString(),
)

useSeoMeta({
  title: () => t("pages.createEventPage.seoTitle"),
  description: () => t("pages.createEventPage.seoDescription"),
  ogTitle: () => t("pages.createEventPage.seoTitle"),
  ogDescription: () => t("pages.createEventPage.seoDescription"),
  ogUrl: () => canonicalUrl.value,
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
