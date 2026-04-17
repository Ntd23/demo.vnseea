<template>
  <div class="space-y-5 pb-10">
    <FundingHero
      :campaign-count="allCampaigns.length"
      :stats="heroStats"
    />

    <FundingFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      v-model:selected-status="selectedStatus"
      :categories="fundingCategories"
      :statuses="fundingStatuses"
      :result-count="filteredCampaigns.length"
      @reset="resetFilters"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section class="space-y-4">
        <div class="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Kết quả</p>
              <h2 class="mt-1 text-2xl font-extrabold text-[var(--color-text)]">{{ resultHeading }}</h2>
              <p class="mt-1 text-sm font-semibold text-[var(--color-muted)]">
                {{ filteredCampaigns.length }} chiến dịch phù hợp
              </p>
            </div>
            <NuxtLink
              to="/create_funding"
              class="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
            >
              <Icon name="i-ph-plus-circle-fill" class="h-5 w-5" />
              Tạo gây quỹ
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
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-soft)] text-[var(--color-primary)]">
            <Icon name="i-ph-hand-heart-fill" class="h-8 w-8" />
          </div>
          <h3 class="mt-4 text-xl font-extrabold text-[var(--color-text)]">Chưa có chiến dịch phù hợp</h3>
          <p class="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[var(--color-muted)]">
            Thử bỏ bớt từ khóa hoặc đổi danh mục để xem thêm các chiến dịch đang gây quỹ.
          </p>
          <button
            type="button"
            class="mt-5 rounded-[18px] border border-[var(--color-border)] px-5 py-3 text-sm font-extrabold text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-soft)]"
            @click="resetFilters"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </section>

      <FundingSidebar
        :stats="sidebarStats"
        :categories="categoryBreakdown"
        @select-category="selectCategory"
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
import type { DonationPayload, FundingCategoryKey, FundingStatusKey, MockFundingCampaign } from "~/composables/useMockFundingData"

type CategoryFilter = "all" | FundingCategoryKey

const { campaigns, fundingCategories, fundingStatuses } = useMockFundingData()

useSeoMeta({
  title: "Kinh phí | VNSEEA",
  description: "Tạo chiến dịch gây quỹ, tìm kiếm, lọc theo danh mục, xem tiến độ và donate mock trong cộng đồng VNSEEA.",
})

const search = ref("")
const selectedCategory = ref<CategoryFilter>("all")
const selectedStatus = ref<FundingStatusKey>("all")
const createdCampaigns = ref<MockFundingCampaign[]>([])
const donations = ref<DonationPayload[]>([])
const donateCampaign = ref<MockFundingCampaign>()

const allCampaigns = computed(() => [...createdCampaigns.value, ...campaigns])

const filteredCampaigns = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return allCampaigns.value.filter((campaign) => {
    const matchesKeyword = keyword.length === 0 || [
      campaign.title,
      campaign.owner,
      campaign.location,
      campaign.categoryLabel,
      campaign.summary,
      campaign.description,
      ...campaign.impact,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory = selectedCategory.value === "all" || campaign.category === selectedCategory.value
    const matchesStatus = selectedStatus.value === "all"
      || (selectedStatus.value === "mine" ? campaign.isOwner : campaign.status === selectedStatus.value)

    return matchesKeyword && matchesCategory && matchesStatus
  })
})

const heroStats = computed(() => [
  {
    label: "Đang gây quỹ",
    value: allCampaigns.value.filter(campaign => campaign.status === "active" || campaign.status === "ending").length,
    description: "Chiến dịch còn nhận donate.",
  },
  {
    label: "Đã huy động",
    value: formatFundingCurrency(allCampaigns.value.reduce((sum, campaign) => sum + campaign.raisedAmount, 0)),
    description: "Tổng số tiền mock hiện có.",
  },
  {
    label: "Donate mới",
    value: donations.value.length,
    description: "Giao dịch trong phiên này.",
  },
])

const sidebarStats = computed(() => [
  { label: "Chiến dịch nổi bật", value: allCampaigns.value.filter(campaign => campaign.isFeatured).length },
  { label: "Của tôi", value: allCampaigns.value.filter(campaign => campaign.isOwner).length },
  { label: "Người ủng hộ", value: allCampaigns.value.reduce((sum, campaign) => sum + campaign.backers, 0) },
])

const categoryBreakdown = computed(() =>
  fundingCategories
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: allCampaigns.value.filter(campaign => campaign.category === category.value).length,
    }))
    .filter(category => category.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi")),
)

const resultHeading = computed(() => {
  if (selectedStatus.value === "mine") return "Chiến dịch của tôi"
  if (selectedStatus.value === "ending") return "Sắp kết thúc"
  if (selectedStatus.value === "funded") return "Đã đạt mục tiêu"
  if (selectedCategory.value !== "all") {
    return fundingCategories.find(category => category.value === selectedCategory.value)?.label ?? "Chiến dịch phù hợp"
  }
  return "Danh sách gây quỹ"
})

const openDonate = (campaign: MockFundingCampaign) => {
  donateCampaign.value = campaign
}

const recordDonation = (payload: DonationPayload) => {
  donations.value = [payload, ...donations.value]
}

const selectCategory = (value: string) => {
  selectedCategory.value = value as CategoryFilter
}

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  selectedStatus.value = "all"
}
</script>
