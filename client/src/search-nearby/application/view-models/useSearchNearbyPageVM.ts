// English description: View model for the nearby map search page.
import { refDebounced } from "@vueuse/core"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { createApiNearbySearchRepository } from "../../infrastructure/repositories/ApiNearbySearchRepository"
import type {
  NearbySearchItem,
  NearbySearchQuery,
  NearbySearchResponse,
  NearbySearchType,
} from "../../domain/types/search-nearby.types"

const readString = (value: unknown) =>
  Array.isArray(value) ? String(value[0] || "") : String(value || "")

const suggestionDebounceMs = 300
const minSearchKeywordLength = 3
const defaultNearbyDistanceKm = 1

const emptyResponse = (): NearbySearchResponse => ({
  status: "ready",
  origin: {
    address: "",
    lat: null,
    lng: null,
  },
  items: [],
})

const sortByDistance = (items: NearbySearchItem[]) =>
  [...items].sort((left, right) => {
    const leftDistance = left.distanceMeters ?? Number.POSITIVE_INFINITY
    const rightDistance = right.distanceMeters ?? Number.POSITIVE_INFINITY

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance
    }

    return left.title.localeCompare(right.title)
  })

export function useSearchNearbyPageVM() {
  const route = useRoute()
  const repository = createApiNearbySearchRepository()

  const searchText = ref(readString(route.query.q))
  const selectedType = ref<NearbySearchType>("all")
  const distanceKm = ref(defaultNearbyDistanceKm)
  const currentDeviceOrigin = ref<{ lat: number, lng: number } | null>(null)
  const deviceOrigin = ref<{ lat: number, lng: number } | null>(null)
  const selectedItemId = ref("")
  const originFocusKey = ref(0)
  const originUpdateKey = ref(0)
  const routeOriginUpdateKey = ref(0)
  const routeFitKey = ref(0)
  const loading = ref(true)
  const hasLoadedOnce = ref(false)
  const errorMessage = ref("")
  const response = ref<NearbySearchResponse>(emptyResponse())
  const debouncedSuggestionText = refDebounced(searchText, suggestionDebounceMs)
  const suggestions = ref<NearbySearchItem[]>([])
  const suggestionsLoading = ref(false)
  const selectedSuggestionItem = shallowRef<NearbySearchItem | null>(null)
  const routeTargetItem = shallowRef<NearbySearchItem | null>(null)
  const routeNavigationActive = ref(false)
  const routeErrorMessage = ref("")
  let requestSequence = 0
  let suggestionRequestSequence = 0
  let isApplyingSuggestion = false

  const tabs = computed(() => [
    { label: "Tất cả", value: "all" as const, icon: "i-ph-squares-four-fill" },
    { label: "Người dùng", value: "user" as const, icon: "i-ph-user-circle-fill" },
    { label: "Trang", value: "page" as const, icon: "i-ph-flag-fill" },
  ])

  const nearbyQuery = computed<NearbySearchQuery>(() => ({
    q: "",
    type: selectedType.value,
    distanceKm: distanceKm.value,
    limit: 40,
    originLat: deviceOrigin.value?.lat ?? null,
    originLng: deviceOrigin.value?.lng ?? null,
  }))
  const suggestionKeyword = computed(() => debouncedSuggestionText.value.trim())
  const shouldFetchSuggestions = computed(() =>
    suggestionKeyword.value.length >= minSearchKeywordLength
    && selectedSuggestionItem.value?.title !== suggestionKeyword.value,
  )
  const suggestionQuery = computed<NearbySearchQuery>(() => ({
    q: suggestionKeyword.value,
    type: "page",
    distanceKm: distanceKm.value,
    limit: 8,
    originLat: deviceOrigin.value?.lat ?? null,
    originLng: deviceOrigin.value?.lng ?? null,
  }))

  const mapItems = computed(() => {
    const merged = sortByDistance(response.value.items)
    const selected = selectedSuggestionItem.value

    if (selected && !merged.some(item => item.id === selected.id)) {
      merged.unshift(selected)
    }

    return merged
  })
  const cardItems = computed(() =>
    selectedSuggestionItem.value ? [selectedSuggestionItem.value] : sortByDistance(response.value.items),
  )
  const items = mapItems
  const origin = computed(() => {
    if (currentDeviceOrigin.value) {
      return {
        address: "Vá»‹ trÃ­ hiá»‡n táº¡i",
        lat: currentDeviceOrigin.value.lat,
        lng: currentDeviceOrigin.value.lng,
      }
    }

    return response.value.origin
  })
  const needsLocation = computed(() => response.value.status === "needs_location")
  const hasOrigin = computed(() => origin.value.lat !== null && origin.value.lng !== null)
  const hasResults = computed(() => cardItems.value.length > 0)
  const isSearchInputSettling = computed(() => false)
  const displayLoading = computed(() =>
    loading.value && !hasLoadedOnce.value && !isSearchInputSettling.value,
  )
  const emptyTitle = computed(() =>
    needsLocation.value
      ? "Chưa có vị trí để tìm kiếm"
      : "Chưa có kết quả gần bạn",
  )
  const emptyDescription = computed(() =>
    needsLocation.value
      ? "Hãy chọn địa chỉ Google trong hồ sơ để VNSEEA có tọa độ làm tâm tìm kiếm."
      : "Thử tăng bán kính hoặc đổi từ khóa tìm kiếm.",
  )
  const resultCountLabel = computed(() => `${items.value.length} kết quả`)

  const selectedItem = computed(() =>
    mapItems.value.find(item => item.id === selectedItemId.value) || null,
  )

  async function refresh() {
    const requestId = ++requestSequence
    const requestQuery = { ...nearbyQuery.value }

    loading.value = true
    errorMessage.value = ""

    try {
      const nextResponse = await repository.searchNearby(requestQuery)

      if (requestId !== requestSequence) {
        return
      }

      response.value = currentDeviceOrigin.value
        ? {
            ...nextResponse,
            origin: {
              address: "Vá»‹ trÃ­ hiá»‡n táº¡i",
              lat: currentDeviceOrigin.value.lat,
              lng: currentDeviceOrigin.value.lng,
            },
          }
        : nextResponse

      if (selectedItemId.value && !response.value.items.some(item => item.id === selectedItemId.value)) {
        selectedItemId.value = ""
      }
    }
    catch (error) {
      if (requestId !== requestSequence) {
        return
      }

      response.value = emptyResponse()
      errorMessage.value = error instanceof Error ? error.message : "Unable to load nearby results."
    }
    finally {
      if (requestId === requestSequence) {
        hasLoadedOnce.value = true
        loading.value = false
      }
    }
  }

  async function refreshSuggestions() {
    if (!shouldFetchSuggestions.value) {
      suggestions.value = []
      suggestionsLoading.value = false
      return
    }

    const requestId = ++suggestionRequestSequence
    const requestQuery = { ...suggestionQuery.value }

    suggestionsLoading.value = true

    try {
      const nextResponse = await repository.searchSuggestions(requestQuery)

      if (
        requestId !== suggestionRequestSequence
        || searchText.value.trim() !== requestQuery.q
        || selectedSuggestionItem.value
      ) {
        return
      }

      if (!currentDeviceOrigin.value && nextResponse.origin.lat !== null && nextResponse.origin.lng !== null) {
        response.value = {
          ...response.value,
          origin: nextResponse.origin,
          status: nextResponse.status,
        }
      }

      suggestions.value = sortByDistance(nextResponse.items)
    }
    catch {
      if (requestId === suggestionRequestSequence) {
        suggestions.value = []
      }
    }
    finally {
      if (requestId === suggestionRequestSequence) {
        suggestionsLoading.value = false
      }
    }
  }

  function clearPinnedResult() {
    selectedSuggestionItem.value = null
    routeTargetItem.value = null
    routeNavigationActive.value = false
    routeErrorMessage.value = ""
  }

  function selectType(type: NearbySearchType) {
    selectedType.value = type
  }

  function selectItem(item: NearbySearchItem) {
    selectedItemId.value = item.id
    routeTargetItem.value = item
    routeNavigationActive.value = false
    routeErrorMessage.value = ""
    routeFitKey.value += 1
  }

  function selectSuggestion(item: NearbySearchItem) {
    isApplyingSuggestion = true
    selectedSuggestionItem.value = item
    selectedItemId.value = item.id
    routeTargetItem.value = item
    routeNavigationActive.value = false
    routeErrorMessage.value = ""
    routeFitKey.value += 1
    searchText.value = item.title
    suggestions.value = []
    suggestionsLoading.value = false

    nextTick(() => {
      isApplyingSuggestion = false
    })
  }

  function requestDirections(item: NearbySearchItem) {
    isApplyingSuggestion = true
    selectedSuggestionItem.value = item
    selectedItemId.value = item.id
    routeTargetItem.value = item
    routeNavigationActive.value = true
    routeErrorMessage.value = ""
    routeFitKey.value += 1
    routeOriginUpdateKey.value += 1
    suggestions.value = []
    suggestionsLoading.value = false

    nextTick(() => {
      isApplyingSuggestion = false
    })
  }

  function clearRoute() {
    routeTargetItem.value = null
    routeNavigationActive.value = false
    routeErrorMessage.value = ""
  }

  function handleRouteError(message: string) {
    routeErrorMessage.value = message || "Unable to draw directions for this result."
  }

  function focusOrigin() {
    selectedItemId.value = ""
    clearRoute()
    originFocusKey.value += 1
  }

  function setCurrentDeviceLocation(
    lat: number,
    lng: number,
    options: { focus?: boolean, updateSearchOrigin?: boolean, redrawRoute?: boolean } = {},
  ) {
    currentDeviceOrigin.value = { lat, lng }

    if (options.updateSearchOrigin || !deviceOrigin.value) {
      deviceOrigin.value = { lat, lng }
    }

    response.value = {
      ...response.value,
      status: "ready",
      origin: {
        address: "Vị trí hiện tại",
        lat,
        lng,
      },
    }

    originUpdateKey.value += 1

    if (routeTargetItem.value && options.redrawRoute !== false) {
      routeOriginUpdateKey.value += 1
    }

    if (options.focus) {
      focusOrigin()
    }
  }

  function focusDeviceLocation(lat: number, lng: number) {
    setCurrentDeviceLocation(lat, lng, {
      focus: true,
      updateSearchOrigin: true,
    })
  }

  function updateDeviceLocation(lat: number, lng: number) {
    setCurrentDeviceLocation(lat, lng, {
      focus: false,
      updateSearchOrigin: false,
      redrawRoute: true,
    })
  }

  function updateLiveDeviceLocation(
    lat: number,
    lng: number,
    options: { updateSearchOrigin?: boolean, redrawRoute?: boolean } = {},
  ) {
    setCurrentDeviceLocation(lat, lng, {
      focus: false,
      updateSearchOrigin: options.updateSearchOrigin ?? false,
      redrawRoute: options.redrawRoute ?? false,
    })
  }

  function clearSearch() {
    searchText.value = ""
    selectedType.value = "all"
    distanceKm.value = defaultNearbyDistanceKm
    suggestions.value = []
    clearPinnedResult()
  }

  watch(
    () => route.query.q,
    () => {
      const nextSearch = readString(route.query.q)

      if (nextSearch !== searchText.value) searchText.value = nextSearch
    },
  )

  watch(searchText, () => {
    if (isApplyingSuggestion) {
      return
    }

    if (selectedSuggestionItem.value) {
      clearPinnedResult()
      return
    }

    if (routeTargetItem.value) {
      clearRoute()
    }
  })
  watch(nearbyQuery, () => { void refresh() }, { immediate: import.meta.client })
  watch(suggestionQuery, () => { void refreshSuggestions() })

  return {
    searchText,
    selectedType,
    distanceKm,
    selectedItemId,
    originFocusKey,
    originUpdateKey,
    routeOriginUpdateKey,
    routeFitKey,
    selectedItem,
    selectedSuggestionItem,
    routeTargetItem,
    routeNavigationActive,
    routeErrorMessage,
    tabs,
    origin,
    items,
    mapItems,
    cardItems,
    suggestions,
    suggestionsLoading,
    loading,
    displayLoading,
    isSearchInputSettling,
    errorMessage,
    needsLocation,
    hasOrigin,
    hasResults,
    emptyTitle,
    emptyDescription,
    resultCountLabel,
    refresh,
    refreshSuggestions,
    selectType,
    selectItem,
    selectSuggestion,
    requestDirections,
    clearRoute,
    handleRouteError,
    focusOrigin,
    focusDeviceLocation,
    updateDeviceLocation,
    updateLiveDeviceLocation,
    clearSearch,
  }
}
