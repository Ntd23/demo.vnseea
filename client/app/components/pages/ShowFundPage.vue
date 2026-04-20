<template>
  <div v-if="campaign" class="space-y-5 pb-10">
    <FundingDetailHero
      :campaign="campaign"
      @donate="openDonate"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <FundingDetailMain :campaign="campaign" />
      <FundingDetailSidebar
        :campaign="campaign"
        @donate="openDonate"
      />
    </div>

    <FundingDonateModal
      :campaign="donateCampaign"
      @close="donateCampaign = undefined"
      @donate="recordDonation"
    />
  </div>

  <div
    v-else
    class="rounded-[34px] border border-dashed border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]"
  >
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-soft)] text-[var(--color-primary)]">
      <Icon name="i-ph-hand-heart-fill" class="h-8 w-8" />
    </div>
    <h1 class="mt-4 text-2xl font-black text-[var(--color-text)]">{{ $t("pages.showFundPage.notFoundTitle") }}</h1>
    <p class="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-[var(--color-muted)]">
      {{ $t("pages.showFundPage.notFoundDescription") }}
    </p>
    <NuxtLink
      to="/funding"
      class="mt-6 inline-flex items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary)] px-5 py-3 text-sm font-extrabold text-white"
    >
      {{ $t("pages.showFundPage.backToFunding") }}
      <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { DonationPayload, MockFundingCampaign } from "~/composables/useMockFundingData"

const route = useRoute()
const { t } = useI18n()
const { findCampaignById } = useMockFundingData()

const donations = ref<DonationPayload[]>([])
const donateCampaign = ref<MockFundingCampaign>()

const campaign = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  return findCampaignById(String(id ?? ""))
})

useSeoMeta({
  title: () => campaign.value ? `${campaign.value.title} | VNSEEA` : t("pages.showFundPage.seoTitle"),
  description: () => campaign.value?.summary ?? t("pages.showFundPage.seoDescription"),
})

const openDonate = (selected: MockFundingCampaign) => {
  donateCampaign.value = selected
}

const recordDonation = (payload: DonationPayload) => {
  donations.value = [payload, ...donations.value]
}
</script>
