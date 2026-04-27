<template>
  <ForumPresentationForumPage />
</template>

<script setup lang="ts">
import {
  filterForumThreads,
  normalizeForumSection,
  readForumQueryValue,
  useForumCatalog,
} from "../../../src/forum/infrastructure/mocks/forumCatalog"
import ForumPresentationForumPage from "../../../src/forum/presentation/pages/ForumPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { sections, threads } = useForumCatalog()

const searchQuery = computed(() =>
  readForumQueryValue(route.query.q).trim(),
)

const selectedSection = computed(() =>
  normalizeForumSection(readForumQueryValue(route.query.section)),
)

const activeSectionLabel = computed(() =>
  sections.value.find(section => section.value === selectedSection.value)?.label
  ?? t("pages.forumPage.allThreads"),
)

const filteredThreads = computed(() =>
  filterForumThreads(threads.value, searchQuery.value, selectedSection.value),
)

const selectedThread = computed(() => {
  const requestedThreadId = readForumQueryValue(route.query.thread).trim()
  if (!requestedThreadId) return null

  return filteredThreads.value.find(thread => thread.id === requestedThreadId) ?? null
})

const seoTitle = computed(() => {
  if (selectedThread.value) {
    return t("pages.forumPage.seoTitleThread", {
      title: selectedThread.value.title,
    })
  }

  if (searchQuery.value && selectedSection.value !== "all") {
    return t("pages.forumPage.seoTitleQuerySection", {
      query: searchQuery.value,
      section: activeSectionLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.forumPage.seoTitleQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedSection.value !== "all") {
    return t("pages.forumPage.seoTitleSection", {
      section: activeSectionLabel.value,
    })
  }

  return t("pages.forumPage.seoTitle")
})

const seoDescription = computed(() => {
  if (selectedThread.value) {
    return t("pages.forumPage.seoDescriptionThread", {
      title: selectedThread.value.title,
      excerpt: selectedThread.value.excerpt,
    })
  }

  if (searchQuery.value && selectedSection.value !== "all") {
    return t("pages.forumPage.seoDescriptionQuerySection", {
      query: searchQuery.value,
      section: activeSectionLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.forumPage.seoDescriptionQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedSection.value !== "all") {
    return t("pages.forumPage.seoDescriptionSection", {
      section: activeSectionLabel.value,
    })
  }

  return t("pages.forumPage.seoDescription")
})

const canonicalUrl = computed(() => {
  const url = new URL("/forum", requestURL.origin)

  if (searchQuery.value) {
    url.searchParams.set("q", searchQuery.value)
  }

  if (selectedSection.value !== "all") {
    url.searchParams.set("section", selectedSection.value)
  }

  if (selectedThread.value) {
    url.searchParams.set("thread", selectedThread.value.id)
  }

  return url.toString()
})

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
