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

const searchTypes: NearbySearchType[] = ["all", "user", "page"]

const normalizeType = (value: unknown): NearbySearchType => {
  const text = Array.isArray(value) ? String(value[0] || "") : String(value || "")

  return searchTypes.includes(text as NearbySearchType) ? text as NearbySearchType : "all"
}

const normalizeDistance = (value: unknown) => {
  const text = Array.isArray(value) ? value[0] : value
  const numeric = Number(text)

  if (!Number.isFinite(numeric)) return 25

  return Math.min(Math.max(Math.round(numeric), 1), 1000)
}

const readString = (value: unknown) =>
  Array.isArray(value) ? String(value[0] || "") : String(value || "")

const searchDebounceMs = 700
const suggestionDebounceMs = 300
const minSearchKeywordLength = 3

const emptyResponse = (): NearbySearchResponse => ({
  status: "ready",
  origin: {
    address: "",
    lat: null,
    lng: null,
  },
  items: [],
})

export function useSearchNearbyPageVM() {
  const route = useRoute()
  const router = useRouter()
  const repository = createApiNearbySearchRepository()

  const searchText = ref(readString(route.query.q))
  const selectedType = ref<NearbySearchType>(normalizeType(route.query.type))
  const distanceKm = ref(normalizeDistance(route.query.distance))
  const selectedItemId = ref("")
  const originFocusKey = ref(0)
  const loading = ref(true)
  const hasLoadedOnce = ref(false)
  const errorMessage = ref("")
  const response = ref<NearbySearchResponse>(emptyResponse())
  const debouncedSearchText = refDebounced(searchText, searchDebounceMs)
  const debouncedSuggestionText = refDebounced(searchText, suggestionDebounceMs)
  const suggestions = ref<NearbySearchItem[]>([])
  const suggestionsLoading = ref(false)
  const selectedSuggestionItem = shallowRef<NearbySearchItem | null>(null)
  const routeTargetItem = shallowRef<NearbySearchItem | null>(null)
  const routeErrorMessage = ref("")
  let requestSequence = 0
  let suggestionRequestSequence = 0
  let isApplyingSuggestion = false

  const tabs = computed(() => [
    { label: "Tất cả", value: "all" as const, icon: "i-ph-squares-four-fill" },
    { label: "Người dùng", value: "user" as const, icon: "i-ph-user-circle-fill" },
    { label: "Trang", value: "page" as const, icon: "i-ph-flag-fill" },
  ])

  const debouncedKeyword = computed(() => debouncedSearchText.value.trim())
  const shouldSearchNearby = computed(() =>
    debouncedKeyword.value.length === 0 || debouncedKeyword.value.length >= minSearchKeywordLength,
  )
  const nearbyQuery = computed<NearbySearchQuery>(() => ({
    q: debouncedKeyword.value,
    type: selectedType.value,
    distanceKm: distanceKm.value,
    limit: 40,
  }))
  const suggestionKeyword = computed(() => debouncedSuggestionText.value.trim())
  const shouldFetchSuggestions = computed(() =>
    suggestionKeyword.value.length >= minSearchKeywordLength
    && selectedSuggestionItem.value?.title !== suggestionKeyword.value,
  )
  const suggestionQuery = computed<NearbySearchQuery>(() => ({
    q: suggestionKeyword.value,
    type: selectedType.value,
    distanceKm: distanceKm.value,
    limit: 8,
  }))

  const items = computed(() =>
    selectedSuggestionItem.value ? [selectedSuggestionItem.value] : response.value.items,
  )
  const origin = computed(() => response.value.origin)
  const needsLocation = computed(() => response.value.status === "needs_location")
  const hasOrigin = computed(() => origin.value.lat !== null && origin.value.lng !== null)
  const hasResults = computed(() => items.value.length > 0)
  const isSearchInputSettling = computed(() =>
    searchText.value.trim() !== debouncedSearchText.value.trim(),
  )
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
    items.value.find(item => item.id === selectedItemId.value) || null,
  )

  async function refresh() {
    if (!shouldSearchNearby.value) {
      return
    }

    if (selectedSuggestionItem.value) {
      loading.value = false
      hasLoadedOnce.value = true
      return
    }

    const requestId = ++requestSequence
    const requestQuery = { ...nearbyQuery.value }

    loading.value = true
    errorMessage.value = ""

    try {
      const nextResponse = await repository.searchNearby(requestQuery)

      if (requestId !== requestSequence || searchText.value.trim() !== requestQuery.q) {
        return
      }

      response.value = nextResponse

      if (selectedItemId.value && !response.value.items.some(item => item.id === selectedItemId.value)) {
        selectedItemId.value = ""
      }
    }
    catch (error) {
      if (requestId !== requestSequence || searchText.value.trim() !== requestQuery.q) {
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

      if (nextResponse.origin.lat !== null && nextResponse.origin.lng !== null) {
        response.value = {
          ...response.value,
          origin: nextResponse.origin,
          status: nextResponse.status,
        }
      }

      suggestions.value = nextResponse.items
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
    routeErrorMessage.value = ""
  }

  function selectType(type: NearbySearchType) {
    selectedType.value = type
  }

  function selectItem(item: NearbySearchItem) {
    selectedItemId.value = item.id
  }

  function selectSuggestion(item: NearbySearchItem) {
    isApplyingSuggestion = true
    selectedSuggestionItem.value = item
    selectedItemId.value = item.id
    routeTargetItem.value = null
    routeErrorMessage.value = ""
    searchText.value = item.title
    suggestions.value = []
    suggestionsLoading.value = false

    nextTick(() => {
      isApplyingSuggestion = false
    })
  }

  function requestDirections(item: NearbySearchItem) {
    selectedItemId.value = item.id
    routeTargetItem.value = item
    routeErrorMessage.value = ""
  }

  function clearRoute() {
    routeTargetItem.value = null
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

  function clearSearch() {
    searchText.value = ""
    selectedType.value = "all"
    distanceKm.value = 25
    suggestions.value = []
    clearPinnedResult()
  }

  function syncRoute() {
    if (!shouldSearchNearby.value) {
      return
    }

    const query: Record<string, string> = {}
    const keyword = debouncedKeyword.value

    if (keyword) query.q = keyword
    if (selectedType.value !== "all") query.type = selectedType.value
    if (distanceKm.value !== 25) query.distance = String(distanceKm.value)

    void router.replace({ path: appRoutes.searchNearby, query })
  }

  watch(
    () => [route.query.q, route.query.type, route.query.distance],
    () => {
      const nextSearch = readString(route.query.q)
      const nextType = normalizeType(route.query.type)
      const nextDistance = normalizeDistance(route.query.distance)

      if (nextSearch !== searchText.value) searchText.value = nextSearch
      if (nextType !== selectedType.value) selectedType.value = nextType
      if (nextDistance !== distanceKm.value) distanceKm.value = nextDistance
    },
  )

  watch([searchText, selectedType, distanceKm], () => {
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
  watch([debouncedSearchText, selectedType, distanceKm], syncRoute)
  watch(nearbyQuery, () => { void refresh() }, { immediate: import.meta.client })
  watch(suggestionQuery, () => { void refreshSuggestions() })

  return {
    appRoutes,
    searchText,
    selectedType,
    distanceKm,
    selectedItemId,
    originFocusKey,
    selectedItem,
    selectedSuggestionItem,
    routeTargetItem,
    routeErrorMessage,
    tabs,
    origin,
    items,
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
    clearSearch,
  }
}
