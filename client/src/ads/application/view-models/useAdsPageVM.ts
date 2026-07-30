// English description: Loads ads manager campaigns and exposes page actions for the Nuxt ads route.

import { createApiAdsRepository } from "../../infrastructure/repositories/ApiAdsRepository"
import type { AdsCampaign } from "../../domain/types/ads.types"

export function useAdsPageVM() {
  const repository = createApiAdsRepository()
  const limit = 20

  const { data, pending, error, refresh } = useAsyncData(
    "ads:overview",
    () => repository.getOverview({ limit }),
    {
      default: () => ({
        campaigns: [],
        balance: 0,
        currency: "",
        currencySymbol: "",
        hasMore: false,
        nextOffset: null,
        canCreateAds: false,
      }),
    },
  )

  const loadingMore = ref(false)
  const loadMoreError = ref("")
  const mutatingId = ref<number | null>(null)
  const mutationError = ref("")

  const campaigns = computed(() => data.value.campaigns)
  const hasMore = computed(() => data.value.hasMore)
  const balance = computed(() => data.value.balance)
  const currency = computed(() => data.value.currency)
  const currencySymbol = computed(() => data.value.currencySymbol)
  const canCreateAds = computed(() => data.value.canCreateAds)

  async function loadMore() {
    const offset = data.value.nextOffset
    if (!offset || loadingMore.value) return

    loadingMore.value = true
    loadMoreError.value = ""

    try {
      const next = await repository.getOverview({ limit, offset })
      const mergedById = new Map<number, AdsCampaign>()

      for (const campaign of [...data.value.campaigns, ...next.campaigns]) {
        mergedById.set(campaign.id, campaign)
      }

      data.value = {
        ...next,
        campaigns: [...mergedById.values()],
      }
    }
    catch (caught) {
      loadMoreError.value = caught instanceof Error ? caught.message : "Unable to load more ads."
    }
    finally {
      loadingMore.value = false
    }
  }

  async function toggleStatus(id: number) {
    const campaign = data.value.campaigns.find(item => item.id === id)
    if (!campaign || mutatingId.value) return

    mutatingId.value = id
    mutationError.value = ""

    try {
      const nextStatus = campaign.status === "active" ? "inactive" : "active"
      await repository.updateCampaignStatus(id, nextStatus)
      campaign.status = nextStatus
    }
    catch (caught) {
      mutationError.value = caught instanceof Error ? caught.message : "Unable to update ad status."
    }
    finally {
      mutatingId.value = null
    }
  }

  const { t } = useI18n()

  async function deleteCampaign(id: number) {
    if (mutatingId.value) return
    if (import.meta.client && !window.confirm(t("ads.page.confirmDelete"))) return

    mutatingId.value = id
    mutationError.value = ""

    try {
      await repository.deleteCampaign(id)
      data.value = {
        ...data.value,
        campaigns: data.value.campaigns.filter(campaign => campaign.id !== id),
      }
    }
    catch (caught) {
      mutationError.value = caught instanceof Error ? caught.message : "Unable to delete ad."
    }
    finally {
      mutatingId.value = null
    }
  }

  return {
    balance,
    campaigns,
    canCreateAds,
    currency,
    currencySymbol,
    error,
    hasMore,
    loadMore,
    loadMoreError,
    loadingMore,
    mutationError,
    mutatingId,
    pending,
    refresh,
    toggleStatus,
    deleteCampaign,
  }
}
