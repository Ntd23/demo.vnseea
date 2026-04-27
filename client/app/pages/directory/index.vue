<template>
  <DirectoryPresentationDirectoryIndexPage />
</template>

<script setup lang="ts">
import type { DirectoryCategoryKey } from "../../../src/directory/domain/types/directory.types"
import { useDirectoryCatalog } from "../../../src/directory/infrastructure/mocks/directoryCatalog"
import DirectoryPresentationDirectoryIndexPage from "../../../src/directory/presentation/pages/DirectoryIndexPage.vue"

definePageMeta({
  layout: "default",
})

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function normalizeCategory(value: string, availableCategories: DirectoryCategoryKey[]): DirectoryCategoryKey {
  return availableCategories.includes(value as DirectoryCategoryKey)
    ? value as DirectoryCategoryKey
    : "all"
}

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { categories } = useDirectoryCatalog()

const searchQuery = computed(() =>
  readQueryValue(route.query.q).trim(),
)

const selectedCategory = computed(() =>
  normalizeCategory(
    readQueryValue(route.query.category),
    categories.value.map(category => category.value),
  ),
)

const categoryLabel = computed(() =>
  categories.value.find(category => category.value === selectedCategory.value)?.label
  ?? t("pages.directoryPage.allCategories"),
)

const seoTitle = computed(() => {
  if (searchQuery.value && selectedCategory.value !== "all") {
    return t("pages.directoryPage.seoTitleQueryCategory", {
      query: searchQuery.value,
      category: categoryLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.directoryPage.seoTitleQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.directoryPage.seoTitleCategory", {
      category: categoryLabel.value,
    })
  }

  return t("pages.directoryPage.seoTitle")
})

const seoDescription = computed(() =>
  searchQuery.value && selectedCategory.value !== "all"
    ? t("pages.directoryPage.seoDescriptionQueryCategory", {
      category: categoryLabel.value,
      query: searchQuery.value,
    })
    : searchQuery.value
      ? t("pages.directoryPage.seoDescriptionQuery", {
        query: searchQuery.value,
      })
      : selectedCategory.value !== "all"
        ? t("pages.directoryPage.seoDescriptionCategory", {
          category: categoryLabel.value,
        })
        : t("pages.directoryPage.seoDescription"),
)

const canonicalUrl = computed(() =>
  new URL(route.fullPath || "/directory", requestURL.origin).toString(),
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
