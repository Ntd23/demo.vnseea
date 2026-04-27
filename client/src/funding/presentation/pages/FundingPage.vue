<template>
  <div class="space-y-5 pb-10">
    <FundingHero
      :campaign-count="filteredCampaigns.length"
      :stats="heroStats"
      :search-term="search || undefined"
      :active-category-label="selectedCategory !== 'all' ? activeCategoryLabel : undefined"
      :active-status-label="selectedStatus !== 'all' ? activeStatusLabel : undefined"
      :has-active-filters="hasActiveFilters"
      @reset="resetFilters"
    />

    <FundingFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      v-model:selected-status="selectedStatus"
      :categories="fundingCategories"
      :statuses="fundingStatuses"
      :result-count="filteredCampaigns.length"
      :status-label="filtersStatusLabel"
      :has-active-filters="hasActiveFilters"
      @reset="resetFilters"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section class="space-y-4">
        <div class="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">{{ $t("pages.fundingPage.results") }}</p>
              <h2 class="mt-1 text-2xl font-extrabold text-[var(--color-text)]">{{ resultHeading }}</h2>
              <p class="mt-1 text-sm font-semibold text-[var(--color-muted)]">
                {{ $t("pages.fundingPage.resultsMeta", { count: filteredCampaigns.length }) }}
              </p>
            </div>
            <NuxtLink
              to="/create_funding"
              class="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
            >
              <Icon name="i-ph-plus-circle-fill" class="h-5 w-5" />
              {{ $t("pages.fundingPage.createCampaign") }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="filteredCampaigns.length > 0" class="grid gap-4 lg:grid-cols-2">
          <FundingCard
            v-for="campaign in filteredCampaigns"
            :key="campaign.id"
            :campaign="campaign"
            @donate="openDonate"
          />
        </div>

        <div
          v-else
          class="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]"
        >
          <FoundationEmptyState
            icon="i-ph-hand-heart-fill"
            :title="$t('pages.fundingPage.emptyTitle')"
            :description="$t('pages.fundingPage.emptyDescription')"
            :primary-label="$t('pages.fundingPage.reset')"
            @primary="resetFilters"
          />
        </div>
      </section>

      <FundingSidebar
        :stats="sidebarStats"
        :categories="categoryBreakdown"
        :selected-category="selectedCategory"
        :status-label="filtersStatusLabel"
        :has-active-filters="hasActiveFilters"
        @select-category="selectCategory"
        @reset="resetFilters"
      />
    </div>

    <FundingDonateModal
      :campaign="donateCampaign"
      @close="donateCampaign = undefined"
      @donate="recordDonation"
    />
  </div>
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from "vue-router"
import type { DonationPayload, FundingCategoryKey, FundingStatusKey, MockFundingCampaign } from "../../domain/types/funding.types"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import {
  applyFundingDonation,
  cloneFundingCampaign,
  filterFundingCampaigns,
  formatFundingCurrency,
  normalizeFundingCategory,
  normalizeFundingStatus,
  readFundingQueryValue,
  useFundingCatalog,
} from "../../infrastructure/mocks/fundingCatalog"
import FundingCard from "../components/FundingCard.vue"
import FundingDonateModal from "../components/FundingDonateModal.vue"
import FundingFilters from "../components/FundingFilters.vue"
import FundingHero from "../components/FundingHero.vue"
import FundingSidebar from "../components/FundingSidebar.vue"

type CategoryFilter = "all" | FundingCategoryKey

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { campaigns, fundingCategories, fundingStatuses } = useFundingCatalog()

const search = ref(readFundingQueryValue(route.query.q).trim())
const selectedCategory = ref<CategoryFilter>(
  normalizeFundingCategory(readFundingQueryValue(route.query.category)),
)
const selectedStatus = ref<FundingStatusKey>(
  normalizeFundingStatus(readFundingQueryValue(route.query.status)),
)
const baseCampaigns = ref<MockFundingCampaign[]>(
  campaigns.map(cloneFundingCampaign),
)
const createdCampaigns = ref<MockFundingCampaign[]>([])
const donations = ref<DonationPayload[]>([])
const donateCampaign = ref<MockFundingCampaign>()

const allCampaigns = computed(() => [...createdCampaigns.value, ...baseCampaigns.value])

const activeCategoryLabel = computed(() =>
  fundingCategories.find(category => category.value === selectedCategory.value)?.label
  ?? t("pages.fundingPage.categoryAll"),
)

const activeStatusLabel = computed(() =>
  fundingStatuses.find(status => status.value === selectedStatus.value)?.label
  ?? t("pages.fundingPage.statusAll"),
)

const hasActiveFilters = computed(() =>
  search.value.trim().length > 0
  || selectedCategory.value !== "all"
  || selectedStatus.value !== "all",
)

const filteredCampaigns = computed(() =>
  filterFundingCampaigns(
    allCampaigns.value,
    search.value,
    selectedCategory.value,
    selectedStatus.value,
  ),
)

const heroStats = computed(() => [
  {
    label: t("pages.fundingPage.statActive"),
    value: filteredCampaigns.value.filter(campaign => campaign.status === "active" || campaign.status === "ending").length,
    description: t("pages.fundingPage.statActiveDescription"),
  },
  {
    label: t("pages.fundingPage.statRaised"),
    value: formatFundingCurrency(filteredCampaigns.value.reduce((sum, campaign) => sum + campaign.raisedAmount, 0), locale.value),
    description: t("pages.fundingPage.statRaisedDescription"),
  },
  {
    label: t("pages.fundingPage.statDonations"),
    value: donations.value.length,
    description: t("pages.fundingPage.statDonationsDescription"),
  },
])

const filtersStatusLabel = computed(() => {
  const count = filteredCampaigns.value.length

  if (search.value && selectedCategory.value !== "all") {
    return t("pages.fundingPage.filterStatusSearchCategory", {
      count,
      query: search.value,
      category: activeCategoryLabel.value,
    })
  }

  if (search.value && selectedStatus.value !== "all") {
    return t("pages.fundingPage.filterStatusSearchStatus", {
      count,
      query: search.value,
      status: activeStatusLabel.value,
    })
  }

  if (search.value) {
    return t("pages.fundingPage.filterStatusSearch", {
      count,
      query: search.value,
    })
  }

  if (selectedCategory.value !== "all" && selectedStatus.value !== "all") {
    return t("pages.fundingPage.filterStatusCategoryStatus", {
      count,
      category: activeCategoryLabel.value,
      status: activeStatusLabel.value,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.fundingPage.filterStatusCategory", {
      count,
      category: activeCategoryLabel.value,
    })
  }

  if (selectedStatus.value !== "all") {
    return t("pages.fundingPage.filterStatusStatus", {
      count,
      status: activeStatusLabel.value,
    })
  }

  return t("pages.fundingPage.filterStatusDefault", {
    count,
  })
})

const sidebarStats = computed(() => [
  { label: t("pages.fundingPage.sidebarFeatured"), value: filteredCampaigns.value.filter(campaign => campaign.isFeatured).length },
  { label: t("pages.fundingPage.sidebarMine"), value: filteredCampaigns.value.filter(campaign => campaign.isOwner).length },
  { label: t("pages.fundingPage.sidebarBackers"), value: filteredCampaigns.value.reduce((sum, campaign) => sum + campaign.backers, 0) },
])

const categoryScopeCampaigns = computed(() =>
  filterFundingCampaigns(
    allCampaigns.value,
    search.value,
    "all",
    selectedStatus.value,
  ),
)

const categoryBreakdown = computed(() =>
  fundingCategories
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: categoryScopeCampaigns.value.filter(campaign => campaign.category === category.value).length,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, locale.value)),
)

const resultHeading = computed(() => {
  if (search.value && selectedCategory.value !== "all") {
    return t("pages.fundingPage.headingSearchCategory", {
      query: search.value,
      category: activeCategoryLabel.value,
    })
  }

  if (search.value) {
    return t("pages.fundingPage.headingSearch", {
      query: search.value,
    })
  }

  if (selectedCategory.value !== "all") return activeCategoryLabel.value
  if (selectedStatus.value !== "all") return activeStatusLabel.value
  return t("pages.fundingPage.headingDefault")
})

const openDonate = (campaign: MockFundingCampaign) => {
  donateCampaign.value = allCampaigns.value.find(item => item.id === campaign.id) ?? campaign
}

const recordDonation = (payload: DonationPayload) => {
  donations.value = [payload, ...donations.value]

  const targetCampaign = allCampaigns.value.find(campaign => campaign.id === payload.campaignId)
  if (!targetCampaign) return

  donateCampaign.value = applyFundingDonation(targetCampaign, payload, {
    supporterName: t("pages.fundingPage.recentSupporterName"),
    supporterInitials: t("pages.fundingPage.recentSupporterInitials"),
    fallbackMessage: t("pages.fundingPage.recentSupporterFallbackMessage"),
    donatedAt: t("pages.fundingPage.recentSupporterJustNow"),
  })
}

const selectCategory = (value: string) => {
  selectedCategory.value = normalizeFundingCategory(value)
}

watch(
  () => route.query.q,
  (value) => {
    const normalizedSearch = readFundingQueryValue(value).trim()
    if (normalizedSearch !== search.value) {
      search.value = normalizedSearch
    }
  },
)

watch(
  () => route.query.category,
  (value) => {
    const normalizedCategory = normalizeFundingCategory(readFundingQueryValue(value))
    if (normalizedCategory !== selectedCategory.value) {
      selectedCategory.value = normalizedCategory
    }
  },
)

watch(
  () => route.query.status,
  (value) => {
    const normalizedStatus = normalizeFundingStatus(readFundingQueryValue(value))
    if (normalizedStatus !== selectedStatus.value) {
      selectedStatus.value = normalizedStatus
    }
  },
)

watch(
  () => route.query,
  () => {
    const currentSearch = readFundingQueryValue(route.query.q)
    const normalizedSearch = currentSearch.trim()
    const currentCategory = readFundingQueryValue(route.query.category)
    const normalizedCategory = normalizeFundingCategory(currentCategory)
    const currentStatus = readFundingQueryValue(route.query.status)
    const normalizedStatus = normalizeFundingStatus(currentStatus)

    let changed = false
    const nextQuery: LocationQueryRaw = { ...route.query }

    if (currentSearch !== normalizedSearch) {
      if (normalizedSearch) nextQuery.q = normalizedSearch
      else delete nextQuery.q
      changed = true
    }

    if (currentCategory !== normalizedCategory) {
      if (normalizedCategory !== "all") nextQuery.category = normalizedCategory
      else delete nextQuery.category
      changed = true
    }

    if (currentStatus !== normalizedStatus) {
      if (normalizedStatus !== "all") nextQuery.status = normalizedStatus
      else delete nextQuery.status
      changed = true
    }

    if (changed) {
      router.replace({ query: nextQuery })
    }
  },
  { immediate: true },
)

watch(
  () => [search.value, selectedCategory.value, selectedStatus.value],
  () => {
    const nextSearch = search.value.trim()
    const currentSearch = readFundingQueryValue(route.query.q).trim()
    const currentCategory = normalizeFundingCategory(readFundingQueryValue(route.query.category))
    const currentStatus = normalizeFundingStatus(readFundingQueryValue(route.query.status))

    if (
      nextSearch === currentSearch
      && selectedCategory.value === currentCategory
      && selectedStatus.value === currentStatus
    ) {
      return
    }

    const nextQuery: LocationQueryRaw = { ...route.query }

    if (nextSearch) nextQuery.q = nextSearch
    else delete nextQuery.q

    if (selectedCategory.value !== "all") nextQuery.category = selectedCategory.value
    else delete nextQuery.category

    if (selectedStatus.value !== "all") nextQuery.status = selectedStatus.value
    else delete nextQuery.status

    router.replace({ query: nextQuery })
  },
)

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  selectedStatus.value = "all"
}
</script>
