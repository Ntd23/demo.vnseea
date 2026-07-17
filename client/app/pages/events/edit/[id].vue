<!-- English description: Thin Nuxt route wrapper for editing an owner-managed event. -->
<template>
  <EventsPresentationEditEventPage />
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import EventsPresentationEditEventPage from "../../../../src/events/presentation/pages/EditEventPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() =>
  new URL(
    route.fullPath || appRoutes.editEvent(String(route.params.id || "")),
    requestURL.origin,
  ).toString(),
)

useSeoMeta({
  title: () => t("pages.createEventPage.editSeoTitle"),
  description: () => t("pages.createEventPage.editSeoDescription"),
  ogTitle: () => t("pages.createEventPage.editSeoTitle"),
  ogDescription: () => t("pages.createEventPage.editSeoDescription"),
  ogUrl: () => canonicalUrl.value,
  robots: "noindex, nofollow",
})

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl.value,
    },
  ],
})
</script>
