<template>
  <EventsPresentationEventDetailPage />
</template>

<script setup lang="ts">
import { useEventsCatalog } from "../../../src/events/infrastructure/mocks/eventsCatalog"
import EventsPresentationEventDetailPage from "../../../src/events/presentation/pages/EventDetailPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { findEventById } = useEventsCatalog()

const routeId = computed(() => String(route.params.id || ""))
const event = computed(() => findEventById(routeId.value))
const isMissing = computed(() => !event.value)

const seoTitle = computed(() =>
  event.value?.title
    ? `${event.value.title} | VNSEEA`
    : `${t("pages.eventDetailPage.seoTitle")} | VNSEEA`,
)

const seoDescription = computed(() =>
  event.value?.summary || t("pages.eventDetailPage.seoDescription"),
)

const canonicalUrl = computed(() =>
  new URL(route.path || `/events/${routeId.value}`, requestURL.origin).toString(),
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => event.value?.cover || undefined,
  robots: () => isMissing.value ? "noindex, nofollow" : "index, follow",
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
