// English description: My-products overview view model backed by the product API bridge.

import type { ProductOverviewCard } from "../../domain/types/product-marketplace.types"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"

export const useMyProductsOverview = (
  repository = createApiProductRepository(),
) => {
  const { t } = useI18n()
  const { data, status, error, refresh } = useAsyncData(
    "product:mine:overview",
    () => repository.list({ mine: true, limit: 50 }),
    {
      default: () => ({
        items: [],
        hasMore: false,
        nextOffset: null,
      }),
    },
  )

  const products = computed(() => data.value?.items ?? [])

  const overviewCards = computed<ProductOverviewCard[]>(() => [
    {
      label: t("pages.myProductsPage.activeListings"),
      value: String(products.value.length),
      icon: "i-ph-tag-duotone",
      description: t("pages.myProductsPage.activeListingsDescription"),
    },
    {
      label: t("pages.myProductsPage.drafts"),
      value: "0",
      icon: "i-ph-note-blank-duotone",
      description: t("pages.myProductsPage.draftsDescription"),
    },
    {
      label: t("pages.myProductsPage.sold"),
      value: "0",
      icon: "i-ph-check-circle-duotone",
      description: t("pages.myProductsPage.soldDescription"),
    },
  ])

  return {
    overviewCards,
    products,
    status,
    error,
    refresh,
  }
}
