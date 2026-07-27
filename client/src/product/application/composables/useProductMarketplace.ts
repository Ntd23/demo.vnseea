// English description: Product marketplace view helpers aligned with the PHP Wowonder marketplace API.

import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { watchDebounced } from "@vueuse/core"
import { useChatWidgetLauncher } from "../../../navigation/application/composables/useChatWidgetLauncher"
import { formatProductPrice } from "../formatters/product-currency"
import type {
  ProductCategory,
  ProductDistanceValue,
  ProductListing,
  ProductOverviewCard,
  ProductSelectOption,
  ProductSortValue,
} from "../../domain/types/product-marketplace.types"
import {
  filterProductListings,
  mergeProductMarketplaceResponses,
  sortProductListings,
} from "../../domain/services/product-marketplace.service"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"

export const useProductMarketplace = (
  repository = createApiProductRepository(),
) => {
  const { t, locale } = useI18n()
  const route = useRoute()
  const toast = useToast()
  const { openProductChat } = useChatWidgetLauncher()

  const search = ref("")
  const sortBy = ref<ProductSortValue>("latest")
  const selectedCategory = ref<ProductCategory>(String(route.query.c_id || "all"))
  const selectedSubCategory = ref(String(route.query.sub_id || ""))
  const selectedDistance = ref<ProductDistanceValue>("0")
  const distanceRange = ref(0)
  const currentCoordinates = shallowRef<{ latitude: number, longitude: number } | null>(null)
  const isLocating = ref(false)
  const cartLoadingProductId = ref<number | null>(null)
  const isLoadingMore = ref(false)
  const hasShownDistanceUnavailableToast = ref(false)
  const sellerUserId = computed(() => {
    const raw = route.query.sellerUserId ?? route.query.userId
    return (Array.isArray(raw) ? String(raw[0] ?? "") : String(raw ?? "")).trim()
  })

  const { data: productData, status, error, refresh } = useAsyncData(
    "product:marketplace",
    () => repository.list({
      keyword: search.value,
      category: selectedCategory.value,
      subCategory: selectedSubCategory.value,
      distance: selectedDistance.value,
      latitude: currentCoordinates.value?.latitude,
      longitude: currentCoordinates.value?.longitude,
      sort: sortBy.value,
      sellerUserId: sellerUserId.value || undefined,
      limit: 35,
    }),
    {
      default: () => ({
        items: [],
        hasMore: false,
        nextOffset: null,
        categories: [],
        subCategories: [],
        distanceFilterAvailable: false,
      }),
    },
  )

  const sortOptions = computed<ProductSelectOption<ProductSortValue>[]>(() => [
    { label: t("pages.productsPage.sortBy"), value: "latest" },
    { label: t("pages.productsPage.sortPriceAsc"), value: "price_low" },
    { label: t("pages.productsPage.sortPriceDesc"), value: "price_high" },
  ])

  const categoryOptions = computed<ProductSelectOption<ProductCategory>[]>(() => [
    { label: t("pages.productsPage.categoryType"), value: "all" },
    ...(productData.value?.categories ?? []),
  ])

  const subCategoryOptions = computed<ProductSelectOption<string>[]>(() =>
    (productData.value?.subCategories ?? [])
      .filter(option => selectedCategory.value !== "all" && option.parentId === selectedCategory.value)
      .map(option => ({ label: option.label, value: option.value })),
  )

  const hasSubCategories = computed(() => subCategoryOptions.value.length > 0)
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
      value: String(products.value.filter(item => item.stock > 0).length),
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
  const nearbyCount = computed(() => products.value.filter(item => item.distanceKm > 0 && item.distanceKm <= 5).length)

  const currentSortLabel = computed(
    () => sortBy.value === "latest"
      ? t("pages.productsPage.sortLatest")
      : sortOptions.value.find(option => option.value === sortBy.value)?.label ?? t("pages.productsPage.sortLatest"),
  )

  const resultHeading = computed(() => t("pages.productsPage.resultHeading"))

  const visibleProducts = computed(() => sortProductListings(filterProductListings(products.value, {
    keyword: search.value,
    category: selectedCategory.value,
    subCategory: selectedSubCategory.value,
    distance: selectedDistance.value,
  }), sortBy.value))

  const hasMore = computed(() => Boolean(productData.value?.hasMore && productData.value.nextOffset))
  const distanceFilterUnavailable = computed(() =>
    selectedDistance.value !== "0" && productData.value?.distanceFilterAvailable === false,
  )

  const formatProductCurrency = (product: ProductListing) => formatProductPrice(product, locale.value)

  const formatDistance = (value: number) =>
    value > 0
      ? t("pages.productsPage.distanceKm", {
        value: value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 1 }),
      })
      : ""

  const getErrorMessage = (error: unknown) => {
    const fetchError = error as {
      data?: { statusMessage?: string; message?: string }
      statusMessage?: string
      message?: string
    }

    return fetchError.data?.statusMessage
      || fetchError.data?.message
      || fetchError.statusMessage
      || fetchError.message
      || ""
  }

  const resetFilters = () => {
    search.value = ""
    sortBy.value = "latest"
    selectedCategory.value = "all"
    selectedSubCategory.value = ""
    selectedDistance.value = "0"
    distanceRange.value = 0
    currentCoordinates.value = null
  }

  const requestCurrentCoordinates = async () => {
    if (!import.meta.client || !navigator.geolocation || !window.isSecureContext) {
      toast.add({
        title: t("pages.productsPage.locationPermissionTitle"),
        description: t("pages.productsPage.locationUnsupportedDescription"),
        color: "error",
        icon: "i-ph-map-pin-slash",
      })
      return null
    }

    isLocating.value = true

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        })
      })

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
    }
    catch {
      toast.add({
        title: t("pages.productsPage.locationPermissionTitle"),
        description: t("pages.productsPage.locationPermissionDescription"),
        color: "error",
        icon: "i-ph-map-pin-slash",
      })
      return null
    }
    finally {
      isLocating.value = false
    }
  }

  const applyDistance = async () => {
    const nextDistance = Math.max(0, Math.min(300, Number(distanceRange.value) || 0))

    if (nextDistance === 0) {
      selectedDistance.value = "0"
      currentCoordinates.value = null
      return
    }

    const coordinates = await requestCurrentCoordinates()
    if (!coordinates) {
      distanceRange.value = Number(selectedDistance.value) || 0
      return
    }

    currentCoordinates.value = coordinates
    const nextValue = String(nextDistance)

    if (selectedDistance.value === nextValue) {
      await refresh()
      return
    }

    selectedDistance.value = nextValue
  }

  const applyNearbyStores = async () => {
    distanceRange.value = 15
    await applyDistance()
  }

  const addToCart = async (productId: number) => {
    cartLoadingProductId.value = productId

    try {
      await repository.addToCart(productId)
      toast.add({
        title: t("pages.productsPage.addToCart"),
        color: "success",
      })
      await navigateTo(appRoutes.checkout)
    }
    catch (error) {
      const message = getErrorMessage(error)

      if (/already\s+in\s+cart/i.test(message)) {
        await navigateTo(appRoutes.checkout)
        return
      }

      toast.add({
        title: t("pages.productsPage.addToCart"),
        description: message || t("pages.productsPage.loadErrorTitle"),
        color: "error",
        icon: "i-ph-warning-circle",
      })
    }
    finally {
      cartLoadingProductId.value = null
    }
  }

  const loadMore = async () => {
    if (!productData.value?.nextOffset || isLoadingMore.value) return

    isLoadingMore.value = true

    try {
      const nextPage = await repository.list({
        keyword: search.value,
        category: selectedCategory.value,
        subCategory: selectedSubCategory.value,
        distance: selectedDistance.value,
        latitude: currentCoordinates.value?.latitude,
        longitude: currentCoordinates.value?.longitude,
        sort: sortBy.value,
        sellerUserId: sellerUserId.value || undefined,
        limit: 35,
        offset: productData.value.nextOffset,
      })
      const merged = mergeProductMarketplaceResponses(productData.value, nextPage)

      productData.value = {
        ...nextPage,
        items: merged.items,
        categories: merged.categories,
        subCategories: merged.subCategories,
      }
    }
    finally {
      isLoadingMore.value = false
    }
  }

  const openSellerChat = (product: ProductListing) => {
    if (!product.sellerId) return

    openProductChat({
      sellerId: product.sellerId,
      sellerName: product.seller,
      suggestions: [
        t("pages.productsPage.productInquiryMessage"),
        t("pages.productsPage.productAvailabilityMessage"),
        t("pages.productsPage.productNegotiationMessage"),
      ],
      product: {
        id: String(product.id),
        title: product.title,
        imageUrl: product.imageUrl,
        price: formatProductCurrency(product),
        href: product.href,
      },
    })
  }

  watch(selectedCategory, () => {
    selectedSubCategory.value = ""
  })

  watchDebounced(
    [search, selectedCategory, selectedSubCategory, selectedDistance, sortBy, sellerUserId],
    async () => {
      const requestedDistance = selectedDistance.value

      await refresh()

      if (
        requestedDistance === selectedDistance.value
        && requestedDistance !== "0"
        && productData.value?.distanceFilterAvailable === false
        && !hasShownDistanceUnavailableToast.value
      ) {
        hasShownDistanceUnavailableToast.value = true
        toast.add({
          title: t("pages.productsPage.distanceUnavailableTitle"),
          description: t("pages.productsPage.distanceUnavailableDescription"),
          color: "warning",
          icon: "i-ph-map-pin-line",
        })
      }
    },
    { debounce: 350, maxWait: 1000 },
  )

  return {
    search,
    sortBy,
    selectedCategory,
    selectedSubCategory,
    selectedDistance,
    distanceRange,
    isLocating,
    sortOptions,
    categoryOptions,
    subCategoryOptions,
    hasSubCategories,
    heroMainStat,
    heroSecondaryStats,
    nearbyCount,
    currentSortLabel,
    resultHeading,
    visibleProducts,
    status,
    error,
    hasMore,
    distanceFilterUnavailable,
    cartLoadingProductId,
    isLoadingMore,
    formatProductCurrency,
    formatDistance,
    resetFilters,
    applyDistance,
    applyNearbyStores,
    addToCart,
    loadMore,
    openSellerChat,
  }
}
