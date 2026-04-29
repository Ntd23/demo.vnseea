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
    <FoundationEmptyState
      icon="i-ph-hand-heart-fill"
      :title="$t('pages.showFundPage.notFoundTitle')"
      :description="$t('pages.showFundPage.notFoundDescription')"
      :primary-label="$t('pages.showFundPage.backToFunding')"
      @primary="goBackToFunding"
    />
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { DonationPayload, MockFundingCampaign } from "../../domain/types/funding.types"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import { applyFundingDonation, cloneFundingCampaign, useFundingCatalog } from "../../infrastructure/mocks/fundingCatalog"
import FundingDetailHero from "../components/FundingDetailHero.vue"
import FundingDetailMain from "../components/FundingDetailMain.vue"
import FundingDetailSidebar from "../components/FundingDetailSidebar.vue"
import FundingDonateModal from "../components/FundingDonateModal.vue"

const route = useRoute()
const { t } = useI18n()
const { campaigns } = useFundingCatalog()

const fundingId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? String(id[0] || "") : String(id || "")
})

const localCampaigns = ref<MockFundingCampaign[]>(
  campaigns.map(cloneFundingCampaign),
)
const donateCampaign = ref<MockFundingCampaign>()

const campaign = computed(() =>
  localCampaigns.value.find(item => item.id === fundingId.value),
)

const openDonate = (selected: MockFundingCampaign) => {
  donateCampaign.value = localCampaigns.value.find(item => item.id === selected.id) ?? selected
}

const recordDonation = (payload: DonationPayload) => {
  const targetCampaign = localCampaigns.value.find(item => item.id === payload.campaignId)
  if (!targetCampaign) return

  donateCampaign.value = applyFundingDonation(targetCampaign, payload, {
    supporterName: t("pages.fundingPage.recentSupporterName"),
    supporterInitials: t("pages.fundingPage.recentSupporterInitials"),
    fallbackMessage: t("pages.fundingPage.recentSupporterFallbackMessage"),
    donatedAt: t("pages.fundingPage.recentSupporterJustNow"),
  })
}

watch(fundingId, () => {
  donateCampaign.value = undefined
})

function goBackToFunding() {
  navigateTo(appRoutes.funding)
}
</script>
