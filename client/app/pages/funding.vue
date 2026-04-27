<template>
  <FundingPresentationFundingPage />
</template>

<script setup lang="ts">
import {
  filterFundingCampaigns,
  normalizeFundingCategory,
  normalizeFundingStatus,
  readFundingQueryValue,
  useFundingCatalog,
} from "../../src/funding/infrastructure/mocks/fundingCatalog"
import FundingPresentationFundingPage from "../../src/funding/presentation/pages/FundingPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { campaigns, fundingCategories, fundingStatuses } = useFundingCatalog()

const searchQuery = computed(() =>
  readFundingQueryValue(route.query.q).trim(),
)

const selectedCategory = computed(() =>
  normalizeFundingCategory(readFundingQueryValue(route.query.category)),
)

const selectedStatus = computed(() =>
  normalizeFundingStatus(readFundingQueryValue(route.query.status)),
)

const activeCategoryLabel = computed(() =>
  fundingCategories.find(category => category.value === selectedCategory.value)?.label
  ?? t("pages.fundingPage.categoryAll"),
)

const activeStatusLabel = computed(() =>
  fundingStatuses.find(status => status.value === selectedStatus.value)?.label
  ?? t("pages.fundingPage.statusAll"),
)

const filteredCampaigns = computed(() =>
  filterFundingCampaigns(
    campaigns,
    searchQuery.value,
    selectedCategory.value,
    selectedStatus.value,
  ),
)

const seoTitle = computed(() => {
  if (searchQuery.value && selectedCategory.value !== "all") {
    return t("pages.fundingPage.seoTitleQueryCategory", {
      query: searchQuery.value,
      category: activeCategoryLabel.value,
    })
  }

  if (searchQuery.value && selectedStatus.value !== "all") {
    return t("pages.fundingPage.seoTitleQueryStatus", {
      query: searchQuery.value,
      status: activeStatusLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.fundingPage.seoTitleQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.fundingPage.seoTitleCategory", {
      category: activeCategoryLabel.value,
    })
  }

  if (selectedStatus.value !== "all") {
    return t("pages.fundingPage.seoTitleStatus", {
      status: activeStatusLabel.value,
    })
  }

  return t("pages.fundingPage.seoTitle")
})

const seoDescription = computed(() => {
  if (searchQuery.value && selectedCategory.value !== "all") {
    return t("pages.fundingPage.seoDescriptionQueryCategory", {
      query: searchQuery.value,
      category: activeCategoryLabel.value,
      count: filteredCampaigns.value.length,
    })
  }

  if (searchQuery.value && selectedStatus.value !== "all") {
    return t("pages.fundingPage.seoDescriptionQueryStatus", {
      query: searchQuery.value,
      status: activeStatusLabel.value,
      count: filteredCampaigns.value.length,
    })
  }

  if (searchQuery.value) {
    return t("pages.fundingPage.seoDescriptionQuery", {
      query: searchQuery.value,
      count: filteredCampaigns.value.length,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.fundingPage.seoDescriptionCategory", {
      category: activeCategoryLabel.value,
      count: filteredCampaigns.value.length,
    })
  }

  if (selectedStatus.value !== "all") {
    return t("pages.fundingPage.seoDescriptionStatus", {
      status: activeStatusLabel.value,
      count: filteredCampaigns.value.length,
    })
  }

  return t("pages.fundingPage.seoDescription")
})

const canonicalUrl = computed(() => {
  const url = new URL("/funding", requestURL.origin)

  if (searchQuery.value) {
    url.searchParams.set("q", searchQuery.value)
  }

  if (selectedCategory.value !== "all") {
    url.searchParams.set("category", selectedCategory.value)
  }

  if (selectedStatus.value !== "all") {
    url.searchParams.set("status", selectedStatus.value)
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
