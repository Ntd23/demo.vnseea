import type { ProductOverviewCard } from "../../domain/types/product-marketplace.types"

export const useMyProductsOverview = () => {
  const { t } = useI18n()

  const overviewCards = computed<ProductOverviewCard[]>(() => [
    {
      label: t("pages.myProductsPage.activeListings"),
      value: "0",
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
  }
}
