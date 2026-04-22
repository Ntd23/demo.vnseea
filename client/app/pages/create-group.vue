<template>
  <PagesCreateGroupPage />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/create-group", requestURL.origin).toString())

useSeoMeta({
  title: () => `${t("community.creation.group.title")} | VNSEEA`,
  description: () => t("community.creation.group.description"),
  ogTitle: () => `${t("community.creation.group.title")} | VNSEEA`,
  ogDescription: () => t("community.creation.group.description"),
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
