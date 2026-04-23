<template>
  <PagesGroupsPage mode="suggested" />
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || "/suggested-groups", requestURL.origin).toString())

useSeoMeta({
  title: () => `${t("community.groups.titleSuggested")} | VNSEEA`,
  description: () => t("community.groups.descSuggested"),
  ogTitle: () => `${t("community.groups.titleSuggested")} | VNSEEA`,
  ogDescription: () => t("community.groups.descSuggested"),
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
