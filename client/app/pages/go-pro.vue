<template>
  <GoProRuntimePage />
</template>

<script setup lang="ts">
import GoProRuntimePage from "../../src/go-pro/presentation/pages/GoProPage.vue"
import {
  defaultBillingCycle,
  normalizeBillingCycle,
  normalizeProPlanKey,
  readGoProQueryValue,
  useMockGoProData,
} from "../../src/go-pro/infrastructure/mocks/goProCatalog"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { plans } = useMockGoProData()

const billingCycle = computed(() =>
  normalizeBillingCycle(readGoProQueryValue(route.query.billing)),
)

const selectedPlanId = computed(() =>
  normalizeProPlanKey(readGoProQueryValue(route.query.plan)),
)

const activeBillingLabel = computed(() =>
  billingCycle.value === "monthly"
    ? t("pages.goProPage.monthly")
    : t("pages.goProPage.yearlySavings"),
)

const selectedPlan = computed(() =>
  plans.value.find(plan => plan.id === selectedPlanId.value) ?? null,
)

const seoTitle = computed(() => {
  if (selectedPlan.value && billingCycle.value !== defaultBillingCycle) {
    return t("pages.goProPage.seoTitlePlanBilling", {
      plan: selectedPlan.value.name,
      billing: activeBillingLabel.value,
    })
  }

  if (selectedPlan.value) {
    return t("pages.goProPage.seoTitlePlan", {
      plan: selectedPlan.value.name,
    })
  }

  if (billingCycle.value !== defaultBillingCycle) {
    return t("pages.goProPage.seoTitleBilling", {
      billing: activeBillingLabel.value,
    })
  }

  return t("pages.goProPage.seoTitle")
})

const seoDescription = computed(() => {
  if (selectedPlan.value && billingCycle.value !== defaultBillingCycle) {
    return t("pages.goProPage.seoDescriptionPlanBilling", {
      plan: selectedPlan.value.name,
      billing: activeBillingLabel.value,
    })
  }

  if (selectedPlan.value) {
    return t("pages.goProPage.seoDescriptionPlan", {
      plan: selectedPlan.value.name,
    })
  }

  if (billingCycle.value !== defaultBillingCycle) {
    return t("pages.goProPage.seoDescriptionBilling", {
      billing: activeBillingLabel.value,
    })
  }

  return t("pages.goProPage.seoDescription")
})

const canonicalUrl = computed(() => {
  const url = new URL("/go-pro", requestURL.origin)

  if (billingCycle.value !== defaultBillingCycle) {
    url.searchParams.set("billing", billingCycle.value)
  }

  if (selectedPlan.value) {
    url.searchParams.set("plan", selectedPlan.value.id)
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
      href: () => canonicalUrl.value,
    },
  ],
})
</script>
