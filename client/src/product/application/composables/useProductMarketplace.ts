// English description: Product marketplace view helpers for filtering, sorting, and shared price formatting.

import { formatCurrency as formatSharedCurrency } from "#shared-kernel/application/utils/formatCurrency"
import { watchDebounced } from "@vueuse/core"
import type {
  ProductCategory,
  ProductCategoryChip,
  ProductDistanceValue,
  ProductOverviewCard,
  ProductSelectOption,
  ProductSortValue,
} from "../../domain/types/product-marketplace.types"
import { filterProductListings, sortProductListings } from "../../domain/services/product-marketplace.service"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"

export const useProductMarketplace = (
  repository = createApiProductRepository(),
) => {
  const { t, locale } = useI18n()
  const toast = useToast()

  const search = ref("")
  const sortBy = ref<ProductSortValue>("featured")
  const selectedCategory = ref<ProductCategory>("all")
  const selectedDistance = ref<ProductDistanceValue>("all")
  const nearbyOnly = ref(false)
  const cartLoadingProductId = ref<number | null>(null)

  const { data: productData, status, error, refresh } = useAsyncData(
    "product:marketplace",
    () => repository.list({
      keyword: search.value,
      category: selectedCategory.value,
      distance: selectedDistance.value,
      limit: 35,
    }),
    {
      default: () => ({
        items: [],
        hasMore: false,
        nextOffset: null,
      }),
    },
  )

  const sortOptions = computed<ProductSelectOption<ProductSortValue>[]>(() => [
    { label: t("pages.productsPage.sortFeatured"), value: "featured" },
    { label: t("pages.productsPage.sortLatest"), value: "latest" },
    { label: t("pages.productsPage.sortPriceAsc"), value: "price-asc" },
    { label: t("pages.productsPage.sortPriceDesc"), value: "price-desc" },
    { label: t("pages.productsPage.sortNearest"), value: "nearest" },
    { label: t("pages.productsPage.sortRating"), value: "rating" },
  ])

  const categoryOptions = computed<ProductSelectOption<ProductCategory>[]>(() => [
    { label: t("pages.productsPage.category"), value: "all" },
    { label: t("pages.productsPage.categoryVehicles"), value: "vehicles" },
    { label: t("pages.productsPage.categoryHome"), value: "home" },
    { label: t("pages.productsPage.categoryBeauty"), value: "beauty" },
    { label: t("pages.productsPage.categoryBooks"), value: "books" },
    { label: t("pages.productsPage.categoryTech"), value: "tech" },
    { label: t("pages.productsPage.categoryFood"), value: "food" },
  ])

  const distanceOptions = computed<ProductSelectOption<ProductDistanceValue>[]>(() => [
    { label: t("pages.productsPage.distanceAll"), value: "all" },
    { label: t("pages.productsPage.distance5"), value: "5" },
    { label: t("pages.productsPage.distance10"), value: "10" },
    { label: t("pages.productsPage.distance25"), value: "25" },
  ])

  const quickCategoryChips = computed<ProductCategoryChip[]>(() => [
    { label: t("pages.productsPage.categoryAll"), value: "all", icon: "i-ph-squares-four" },
    { label: t("pages.productsPage.categoryVehicles"), value: "vehicles", icon: "i-ph-car-profile" },
    { label: t("pages.productsPage.categoryHome"), value: "home", icon: "i-ph-armchair" },
    { label: t("pages.productsPage.categoryBeauty"), value: "beauty", icon: "i-ph-drop" },
    { label: t("pages.productsPage.categoryBooksShort"), value: "books", icon: "i-ph-book-open-text" },
    { label: t("pages.productsPage.categoryTech"), value: "tech", icon: "i-ph-device-mobile-camera" },
  ])

  const products = computed(() => productData.value?.items ?? [])

  const heroStats = computed<ProductOverviewCard[]>(() => [
    {
      label: t("pages.productsPage.statActiveStores"),
      value: String(products.value.length),
      icon: "i-ph-storefront-fill",
      description: t("pages.productsPage.statActiveStoresDescription"),
    },
    {
      label: t("pages.productsPage.statFeatured"),
      value: String(products.value.filter(item => item.postedHoursAgo <= 8).length),
      icon: "i-ph-seal-check-fill",
      description: t("pages.productsPage.statFeaturedDescription"),
    },
    {
      label: t("pages.productsPage.statMine"),
      value: String(products.value.filter(item => item.mine).length),
      icon: "i-ph-package-fill",
      description: t("pages.productsPage.statMineDescription"),
    },
  ])

  const heroMainStat = computed(() => heroStats.value[0])
  const heroSecondaryStats = computed(() => heroStats.value.slice(1))
  const nearbyCount = computed(() => products.value.filter(item => item.distanceKm <= 5).length)

  const currentSortLabel = computed(
    () => sortOptions.value.find(option => option.value === sortBy.value)?.label ?? t("pages.productsPage.sortFeatured"),
  )

  const activeFiltersLabel = computed(() => {
    const labels: string[] = []

    if (selectedCategory.value !== "all") {
      labels.push(categoryOptions.value.find(option => option.value === selectedCategory.value)?.label ?? "")
    }

    if (selectedDistance.value !== "all") {
      labels.push(distanceOptions.value.find(option => option.value === selectedDistance.value)?.label ?? "")
    }

    if (nearbyOnly.value) labels.push(t("pages.productsPage.nearbyFilter"))

    return labels.length > 0 ? labels.join(" • ") : t("pages.productsPage.allProducts")
  })

  const resultHeading = computed(() => t("pages.productsPage.resultHeading"))

  const visibleProducts = computed(() => sortProductListings(filterProductListings(products.value, {
    keyword: search.value,
    category: selectedCategory.value,
    distance: selectedDistance.value,
    nearbyOnly: nearbyOnly.value,
  }), sortBy.value))

  const formatProductCurrency = (value: number, currency?: string) =>
    formatSharedCurrency(value, {
      currency: currency || "VND",
      locale: locale.value,
    })

  const formatDistance = (value: number) =>
    t("pages.productsPage.distanceKm", {
      value: value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 1 }),
    })

  const resetFilters = () => {
    search.value = ""
    sortBy.value = "featured"
    selectedCategory.value = "all"
    selectedDistance.value = "all"
    nearbyOnly.value = false
  }

  const addToCart = async (productId: number) => {
    cartLoadingProductId.value = productId

    try {
      await repository.addToCart(productId)
      toast.add({
        title: t("pages.productsPage.addToCart"),
        color: "success",
      })
    }
    finally {
      cartLoadingProductId.value = null
    }
  }

  watchDebounced(
    [search, selectedCategory, selectedDistance],
    () => {
      refresh()
    },
    { debounce: 350, maxWait: 1000 },
  )

  return {
    search,
    sortBy,
    selectedCategory,
    selectedDistance,
    nearbyOnly,
    sortOptions,
    categoryOptions,
    distanceOptions,
    quickCategoryChips,
    heroMainStat,
    heroSecondaryStats,
    nearbyCount,
    currentSortLabel,
    activeFiltersLabel,
    resultHeading,
    visibleProducts,
    status,
    error,
    cartLoadingProductId,
    formatProductCurrency,
    formatDistance,
    resetFilters,
    addToCart,
  }
}
