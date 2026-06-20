// English description: Coordinates offer list loading, pagination, and delete mutations.

import { createApiOfferRepository } from "../../infrastructure/repositories/ApiOfferRepository"
import type { Offer } from "../../domain/types/offer.types"
import type { MaybeRefOrGetter } from "vue"

export function useOfferListVM(input?: { pageId?: MaybeRefOrGetter<number | undefined>; limit?: number }) {
  const repository = createApiOfferRepository()
  const { t } = useI18n()
  const toast = useToast()
  const pageId = computed(() => Number(toValue(input?.pageId) || 0))
  const limit = input?.limit ?? 10
  const deletingId = ref<number | null>(null)
  const loadingMore = ref(false)
  const loadMoreError = ref("")

  const { data, status, error, refresh } = useAsyncData(
    () => `offers:list:${pageId.value || "all"}:${limit}`,
    () => repository.getOffers({
      limit,
      pageId: pageId.value || undefined,
    }),
    {
      watch: [pageId],
      default: () => ({ offers: [], hasMore: false, nextAfterId: null }),
    },
  )

  const offers = computed({
    get: () => data.value?.offers ?? [],
    set: (value: Offer[]) => {
      data.value = {
        offers: value,
        hasMore: data.value?.hasMore ?? false,
        nextAfterId: data.value?.nextAfterId ?? null,
      }
    },
  })
  const hasMore = computed(() => data.value?.hasMore === true)
  const nextAfterId = computed(() => data.value?.nextAfterId ?? null)
  const pending = computed(() => status.value === "pending")

  async function loadMore() {
    if (loadingMore.value || !hasMore.value || !nextAfterId.value) return

    loadingMore.value = true
    loadMoreError.value = ""

    try {
      const response = await repository.getOffers({
        limit,
        afterId: nextAfterId.value,
        pageId: pageId.value || undefined,
      })
      data.value = {
        offers: [...offers.value, ...response.offers],
        hasMore: response.hasMore,
        nextAfterId: response.nextAfterId,
      }
    }
    catch (err) {
      loadMoreError.value = err instanceof Error ? err.message : t("offers.errors.loadMore")
    }
    finally {
      loadingMore.value = false
    }
  }

  async function deleteOffer(offerId: number) {
    if (deletingId.value) return

    deletingId.value = offerId

    try {
      await repository.deleteOffer(offerId)
      offers.value = offers.value.filter(offer => offer.id !== offerId)
      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: t("offers.deleteSuccess"),
      })
    }
    catch (err) {
      toast.add({
        color: "error",
        icon: "i-ph-warning-circle-fill",
        title: t("offers.errors.delete"),
        description: err instanceof Error ? err.message : undefined,
      })
    }
    finally {
      deletingId.value = null
    }
  }

  return {
    offers,
    status,
    pending,
    error,
    refresh,
    hasMore,
    loadingMore,
    loadMoreError,
    deletingId,
    loadMore,
    deleteOffer,
  }
}
