<template>
  <FundingPresentationShowFundPage />
</template>

<script setup lang="ts">
import { useFundingCatalog } from "../../../src/funding/infrastructure/mocks/fundingCatalog"
import FundingPresentationShowFundPage from "../../../src/funding/presentation/pages/ShowFundPage.vue"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { findCampaignById } = useFundingCatalog()

const fundingId = computed(() => {
  const value = route.params.id
  return Array.isArray(value) ? String(value[0] || "") : String(value || "")
})

const campaign = computed(() =>
  findCampaignById(fundingId.value),
)

const seoTitle = computed(() => {
  if (!campaign.value) return t("pages.showFundPage.seoTitle")

  return t("pages.showFundPage.seoTitleCampaign", {
    title: campaign.value.title,
  })
})

const seoDescription = computed(() => {
  if (!campaign.value) return t("pages.showFundPage.seoDescription")

  return t("pages.showFundPage.seoDescriptionCampaign", {
    title: campaign.value.title,
    summary: campaign.value.summary,
  })
})

const canonicalUrl = computed(() =>
  new URL(`/show_fund/${fundingId.value}`, requestURL.origin).toString(),
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
