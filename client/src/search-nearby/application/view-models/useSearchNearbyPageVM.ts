// English description: View model for the nearby map search page.
import { refDebounced } from "@vueuse/core"
import { createApiNearbySearchRepository } from "../../infrastructure/repositories/ApiNearbySearchRepository"
import type {
  NearbySearchItem,
  NearbySearchQuery,
  NearbySearchResponse,
} from "../../domain/types/search-nearby.types"

const readString = (value: unknown) =>
  Array.isArray(value) ? String(value[0] || "") : String(value || "")

const readCoordinate = (value: unknown, min: number, max: number) => {
  const rawValue = readString(value).trim()

  if (!rawValue) {
    return null
  }

  const parsed = Number(rawValue)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null
}

const suggestionDebounceMs = 300
const minSearchKeywordLength = 3
const defaultNearbyDistanceKm = 3

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

const createSharedLocationItem = (input: {
  latitude: number
  longitude: number
  title: string
  address: string
  avatarUrl: string
}): NearbySearchItem => {
  const coordinateLabel = `${input.latitude}, ${input.longitude}`
  const title = input.title || input.address || coordinateLabel
  const address = input.address || coordinateLabel

  return {
    id: `shared-location-${input.latitude}-${input.longitude}`,
    backendId: 0,
    type: "place",
    title,
    subtitle: "Google Maps",
    description: "",
    locationLabel: address,
    avatarUrl: input.avatarUrl,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinateLabel)}`,
    lat: input.latitude,
    lng: input.longitude,
    distanceMeters: 0,
    markerKind: "avatar",
    pinned: true,
  }
}

export function useSearchNearbyPageVM() {
  const route = useRoute()
  const repository = createApiNearbySearchRepository()

  const initialSource = readString(route.query.source)
  const initialTargetLatitude = readCoordinate(route.query.lat, -90, 90)
  const initialTargetLongitude = readCoordinate(route.query.lng, -180, 180)
  const initialTargetCoordinates = initialTargetLatitude !== null && initialTargetLongitude !== null
    ? { lat: initialTargetLatitude, lng: initialTargetLongitude }
    : null
  const initialSharedOrigin = initialSource === "message" && initialTargetCoordinates
    ? initialTargetCoordinates
    : null
  const initialSharedLocationItem = initialTargetCoordinates && ["message", "post"].includes(initialSource)
    ? createSharedLocationItem({
        latitude: initialTargetCoordinates.lat,
        longitude: initialTargetCoordinates.lng,
        title: readString(route.query.title).trim(),
        address: readString(route.query.address).trim(),
        avatarUrl: readString(route.query.avatar).trim(),
      })
    : null
  const sharedOriginTitle = ref(readString(route.query.title).trim())
  const hasSharedOrigin = ref(Boolean(initialSharedOrigin))

  const searchText = ref(initialSharedLocationItem?.title || readString(route.query.q))
  const distanceKm = ref(defaultNearbyDistanceKm)
  const currentDeviceOrigin = ref<{ lat: number, lng: number } | null>(initialSharedOrigin)
  const deviceOrigin = ref<{ lat: number, lng: number } | null>(initialSharedOrigin)
  const selectedItemId = ref(initialSharedLocationItem?.id || "")
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
  const selectedSuggestionItem = shallowRef<NearbySearchItem | null>(initialSharedLocationItem)
  const routeTargetItem = shallowRef<NearbySearchItem | null>(null)
  const routeNavigationActive = ref(false)
  const routeErrorMessage = ref("")
  let requestSequence = 0
  let suggestionRequestSequence = 0
  let isApplyingSuggestion = false

  const nearbyQuery = computed<NearbySearchQuery>(() => ({
    q: "",
    type: "page",
    distanceKm: distanceKm.value,
    limit: 40,
    originLat: deviceOrigin.value?.lat ?? null,
    originLng: deviceOrigin.value?.lng ?? null,
  }))
  const suggestionKeyword = computed(() => debouncedSuggestionText.value.trim())
  const shouldFetchSuggestions = computed(() =>
    deviceOrigin.value !== null
    && suggestionKeyword.value.length >= minSearchKeywordLength
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
        address: hasSharedOrigin.value && sharedOriginTitle.value
          ? sharedOriginTitle.value
          : "Vị trí hiện tại",
        lat: currentDeviceOrigin.value.lat,
        lng: currentDeviceOrigin.value.lng,
      }
    }

    return {
      address: "",
      lat: null,
      lng: null,
    }
  })
  const hasOrigin = computed(() => origin.value.lat !== null && origin.value.lng !== null)
  const needsLocation = computed(() => !hasOrigin.value)
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
      ? "Hãy bật quyền vị trí để VNSEEA dùng tọa độ realtime của thiết bị làm tâm tìm kiếm."
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

    if (requestQuery.originLat === null || requestQuery.originLng === null) {
      response.value = emptyResponse()
      hasLoadedOnce.value = false
      loading.value = false
      return
    }

    try {
      const nextResponse = await repository.searchNearby(requestQuery)

      if (requestId !== requestSequence) {
        return
      }

      const pageOnlyResponse = {
        ...nextResponse,
        items: nextResponse.items.filter(item => item.type === "page"),
      }

      response.value = currentDeviceOrigin.value
        ? {
            ...pageOnlyResponse,
            status: "ready",
            origin: {
              address: "Vị trí hiện tại",
              lat: currentDeviceOrigin.value.lat,
              lng: currentDeviceOrigin.value.lng,
            },
          }
        : pageOnlyResponse

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

      suggestions.value = sortByDistance(
        nextResponse.items.filter(item => item.type === "page"),
      )
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

  function selectItem(item: NearbySearchItem) {
    selectedSuggestionItem.value = item
    selectedItemId.value = item.id
    routeTargetItem.value = null
    routeNavigationActive.value = false
    routeErrorMessage.value = ""
  }

  function selectSuggestion(item: NearbySearchItem) {
    isApplyingSuggestion = true
    selectedSuggestionItem.value = item
    selectedItemId.value = item.id
    routeTargetItem.value = null
    routeNavigationActive.value = false
    routeErrorMessage.value = ""
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
    if (!routeNavigationActive.value) {
      selectedItemId.value = ""
      clearRoute()
    }
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
    hasSharedOrigin.value = false
    const preserveSelectedItem = Boolean(selectedSuggestionItem.value)
    setCurrentDeviceLocation(lat, lng, {
      focus: !preserveSelectedItem,
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

  watch(
    () => [
      route.query.lat,
      route.query.lng,
      route.query.title,
      route.query.address,
      route.query.avatar,
      route.query.source,
    ],
    () => {
      const latitude = readCoordinate(route.query.lat, -90, 90)
      const longitude = readCoordinate(route.query.lng, -180, 180)
      const source = readString(route.query.source)

      if (latitude === null || longitude === null) return

      sharedOriginTitle.value = readString(route.query.title).trim()
      if (source === "message") {
        hasSharedOrigin.value = true
        setCurrentDeviceLocation(latitude, longitude, {
          focus: false,
          updateSearchOrigin: true,
        })
      }

      if (source === "message" || source === "post") {
        const item = createSharedLocationItem({
          latitude,
          longitude,
          title: sharedOriginTitle.value,
          address: readString(route.query.address).trim(),
          avatarUrl: readString(route.query.avatar).trim(),
        })
        isApplyingSuggestion = true
        selectedSuggestionItem.value = item
        selectedItemId.value = item.id
        routeTargetItem.value = null
        routeNavigationActive.value = false
        routeErrorMessage.value = ""
        searchText.value = item.title
        suggestions.value = []

        nextTick(() => {
          isApplyingSuggestion = false
        })
      }
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
