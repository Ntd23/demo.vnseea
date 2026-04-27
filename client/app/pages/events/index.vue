<template>
  <EventsPresentationEventsPage />
</template>

<script setup lang="ts">
import EventsPresentationEventsPage from "../../../src/events/presentation/pages/EventsPage.vue"
import type { EventTabKey } from "../../../src/events/domain/types/events.types"
import {
  eventTabKeys,
  useEventsCatalog,
} from "../../../src/events/infrastructure/mocks/eventsCatalog"

definePageMeta({
  layout: "default",
})

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function normalizeTab(value: string): EventTabKey {
  return eventTabKeys.includes(value as EventTabKey)
    ? value as EventTabKey
    : "upcoming"
}

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { eventTabs } = useEventsCatalog()

const searchQuery = computed(() =>
  readQueryValue(route.query.q).trim(),
)

const selectedTab = computed(() =>
  normalizeTab(readQueryValue(route.query.tab)),
)

const tabLabel = computed(() =>
  eventTabs.find(tab => tab.key === selectedTab.value)?.label
  ?? t("pages.eventsPage.tabUpcoming"),
)

const seoTitle = computed(() => {
  if (searchQuery.value && selectedTab.value !== "upcoming") {
    return t("pages.eventsPage.seoTitleQueryTab", {
      query: searchQuery.value,
      tab: tabLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.eventsPage.seoTitleQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedTab.value !== "upcoming") {
    return t("pages.eventsPage.seoTitleTab", {
      tab: tabLabel.value,
    })
  }

  return t("pages.eventsPage.seoTitle")
})

const seoDescription = computed(() => {
  if (searchQuery.value && selectedTab.value !== "upcoming") {
    return t("pages.eventsPage.seoDescriptionQueryTab", {
      query: searchQuery.value,
      tab: tabLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.eventsPage.seoDescriptionQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedTab.value !== "upcoming") {
    return t("pages.eventsPage.seoDescriptionTab", {
      tab: tabLabel.value,
    })
  }

  return t("pages.eventsPage.seoDescription")
})

const canonicalUrl = computed(() =>
  new URL(route.fullPath || "/events", requestURL.origin).toString(),
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
