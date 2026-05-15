// English description: Funding page view-model that owns query sync, backend loading, pagination, and donation actions.

import type { FundingCampaign, FundingTabKey } from "../../domain/types/funding.types"
import { ApiFundingRepository } from "../../infrastructure/repositories/ApiFundingRepository"

const readQueryValue = (value: unknown) => Array.isArray(value) ? String(value[0] || "") : String(value || "")

const normalizeTab = (value: string): FundingTabKey => value === "mine" ? "mine" : "browse"

export function useFundingPageVM() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const repository = new ApiFundingRepository()
  const activeTab = computed(() => normalizeTab(readQueryValue(route.query.tab)))
  const donationTarget = ref<FundingCampaign | null>(null)
  const donationAmount = ref<number | null>(null)
  const donating = ref(false)

  const { data, pending, error, refresh } = useAsyncData(
    () => `funding:${activeTab.value}`,
    () => repository.getCatalog({ tab: activeTab.value }),
    { watch: [activeTab] },
  )

  const items = computed(() => data.value?.items ?? [])
  const canCreate = computed(() => Boolean(data.value?.canCreate))
  const currency = computed(() => data.value?.currency ?? "")
  const currencySymbol = computed(() => data.value?.currencySymbol ?? "")
  const hasMore = computed(() => Boolean(data.value?.hasMore))
  const loadingMore = ref(false)

  const setTab = async (tab: FundingTabKey) => {
    await router.push({
      path: "/funding",
      query: tab === "mine" ? { tab } : {},
    })
  }

  const loadMore = async () => {
    if (!data.value?.nextOffset || loadingMore.value) return
    loadingMore.value = true

    try {
      const next = await repository.getCatalog({
        tab: activeTab.value,
        offset: data.value.nextOffset,
      })
      data.value = {
        ...next,
        items: [...items.value, ...next.items],
      }
    }
    finally {
      loadingMore.value = false
    }
  }

  const openDonate = (campaign: FundingCampaign) => {
    if (!campaign.canDonate) return
    donationTarget.value = campaign
    donationAmount.value = null
  }

  const submitDonation = async () => {
    if (!donationTarget.value || !donationTarget.value.canDonate || !donationAmount.value) return
    donating.value = true

    try {
      await repository.donate({
        id: donationTarget.value.id,
        amount: donationAmount.value,
      })
      donationTarget.value = null
      await refresh()
    }
    catch (err) {
      toast.add({
        color: "error",
        title: err instanceof Error ? err.message : "Unable to donate.",
      })
    }
    finally {
      donating.value = false
    }
  }

  return {
    activeTab,
    items,
    canCreate,
    currency,
    currencySymbol,
    hasMore,
    pending,
    error,
    loadingMore,
    donationTarget,
    donationAmount,
    donating,
    setTab,
    loadMore,
    openDonate,
    submitDonation,
  }
}
