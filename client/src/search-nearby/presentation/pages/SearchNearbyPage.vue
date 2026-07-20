<!-- English description: Full-screen map-first nearby search page for users and pages. -->

<template>
  <section ref="pageRoot" class="nearby-map-page">
    <ClientOnly v-if="canUseNearbyMap">
      <NearbySearchMap
        class="nearby-map-page__map"
        :origin="origin"
        :items="displayMapItems"
        :selected-item-id="selectedItemId"
        :origin-focus-key="originFocusKey"
        :origin-update-key="originUpdateKey"
        :route-origin-update-key="routeOriginUpdateKey"
        :route-fit-key="routeFitKey"
        :route-target-item="routeTargetItem"
        :route-navigation-active="routeNavigationActive"
        :origin-heading="liveOriginHeading"
        :search-radius-km="displaySearchRadiusKm"
        :zoom-in-key="mapZoomInKey"
        :zoom-out-key="mapZoomOutKey"
        @select="selectItem"
        @directions="handleDirectionsRequest"
        @route-error="handleRouteError"
      />
      <template #fallback>
        <div class="nearby-map-page__fallback" />
      </template>
    </ClientOnly>

    <div v-if="canUseNearbyMap" class="nearby-map-page__topbar">
      <div class="nearby-map-page__search">
        <div class="nearby-map-page__search-field">
          <UIcon name="i-ph-magnifying-glass-duotone" class="nearby-map-page__search-icon" />
          <input
            v-model="searchText"
            class="nearby-map-page__search-input"
            type="search"
            :placeholder="searchPlaceholder"
            autocomplete="off"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @keydown.enter.prevent="handleSearchEnter"
          >
          <UIcon
            v-if="suggestionsLoading || googlePlacesLoading || googleNearbyLoading"
            name="i-ph-spinner-gap-duotone"
            class="nearby-map-page__search-loading nearby-map-page__spin"
          />
        </div>

        <div v-if="showSuggestionPanel" class="nearby-map-page__suggestions">
          <button
            v-for="item in suggestionOptions"
            :key="item.id"
            type="button"
            class="nearby-map-page__suggestion"
            @mousedown.prevent="handleSuggestionSelect(item)"
          >
              <span class="nearby-map-page__suggestion-avatar">
                <img v-if="item.raw?.avatarUrl" :src="item.raw.avatarUrl" :alt="item.label">
                <UIcon v-else :name="item.kind === 'place' ? 'i-ph-map-pin-fill' : item.raw?.type === 'page' ? 'i-ph-flag-fill' : 'i-ph-user-circle-fill'" />
              </span>
              <span class="nearby-map-page__suggestion-copy">
                <span class="nearby-map-page__suggestion-title">{{ item.label }}</span>
                <span class="nearby-map-page__suggestion-meta">{{ getSuggestionMeta(item) }}</span>
              </span>
          </button>
          <div v-if="suggestionOptions.length === 0" class="nearby-map-page__suggestion-empty-wrap">
            <span class="nearby-map-page__suggestion-empty">{{ suggestionEmptyText }}</span>
          </div>
        </div>
      </div>

    </div>

    <div v-if="canUseNearbyMap" class="nearby-map-page__map-controls" :aria-label="t('pages.searchNearby.mapControlsLabel')">
      <button type="button" class="nearby-map-page__map-control" :aria-label="t('pages.searchNearby.fullscreen')" @click="toggleMapFullscreen">
        <UIcon name="i-ph-corners-out-bold" />
      </button>
      <button type="button" class="nearby-map-page__map-control" :aria-label="t('pages.searchNearby.zoomIn')" @click="zoomMapIn">
        <UIcon name="i-ph-plus-bold" />
      </button>
      <button type="button" class="nearby-map-page__map-control" :aria-label="t('pages.searchNearby.zoomOut')" @click="zoomMapOut">
        <UIcon name="i-ph-minus-bold" />
      </button>
      <button type="button" class="nearby-map-page__map-control nearby-map-page__map-control--primary" :aria-label="t('pages.searchNearby.myLocation')" @click="handleMyLocationClick">
        <UIcon name="i-ph-crosshair-fill" />
      </button>
      <button
        type="button"
        class="nearby-map-page__map-control"
        :class="{ 'nearby-map-page__map-control--active': showMapGuide }"
        :aria-label="t('pages.searchNearby.mapGuideToggle')"
        @click="showMapGuide = !showMapGuide"
      >
        <UIcon name="i-ph-info-bold" />
      </button>
    </div>

    <div v-if="canUseNearbyMap && showMapGuide" class="nearby-map-page__map-guide">
      <div class="nearby-map-page__map-guide-title">
        <UIcon name="i-ph-navigation-arrow-fill" />
        <span>{{ t("pages.searchNearby.mapGuideTitle") }}</span>
      </div>
      <ul>
        <li>{{ t("pages.searchNearby.mapGuideDefaultZoom") }}</li>
        <li>{{ t("pages.searchNearby.mapGuideLocateButton") }}</li>
        <li>{{ t("pages.searchNearby.mapGuideIos") }}</li>
        <li>{{ t("pages.searchNearby.mapGuideAndroid") }}</li>
        <li>{{ t("pages.searchNearby.mapGuideGestures") }}</li>
      </ul>
    </div>

    <div v-if="canUseNearbyMap" class="nearby-map-page__bottom">
      <div class="nearby-map-page__panel">
        <div v-if="routeErrorMessage" class="nearby-map-page__route-error">
          <Icon name="i-ph-warning-circle-duotone" />
          <span>{{ routeErrorMessage }}</span>
          <button type="button" @click="clearRoute">{{ t("pages.searchNearby.hide") }}</button>
        </div>

        <div v-if="showNearbySkeleton" class="nearby-map-page__skeleton" aria-hidden="true">
          <div class="nearby-map-page__skeleton-card">
            <span class="nearby-map-page__skeleton-avatar" />
            <span class="nearby-map-page__skeleton-line nearby-map-page__skeleton-line--wide" />
            <span class="nearby-map-page__skeleton-line nearby-map-page__skeleton-line--short" />
          </div>
          <div class="nearby-map-page__skeleton-card">
            <span class="nearby-map-page__skeleton-avatar" />
            <span class="nearby-map-page__skeleton-line nearby-map-page__skeleton-line--medium" />
            <span class="nearby-map-page__skeleton-line nearby-map-page__skeleton-line--short" />
          </div>
        </div>

        <div v-else-if="errorMessage" class="nearby-map-page__state nearby-map-page__state--error">
          <Icon name="i-ph-warning-circle-duotone" />
          <span>{{ errorMessage }}</span>
          <button type="button" @click="refresh">{{ t("pages.searchNearby.retry") }}</button>
        </div>

        <div v-else-if="!displayHasResults" class="nearby-map-page__empty">
          <Icon name="i-ph-map-pin-duotone" />
          <div>
            <h2>{{ emptyTitle }}</h2>
            <p>{{ emptyDescription }}</p>
          </div>
          <NuxtLink v-if="needsLocation" :to="appRoutes.settingsPage('profile')" class="nearby-map-page__empty-action">
            {{ t("pages.searchNearby.updateAddress") }}
          </NuxtLink>
          <button v-else type="button" class="nearby-map-page__empty-action" @click="handleClearSearch">
            {{ t("pages.searchNearby.clearFilter") }}
          </button>
        </div>

        <div ref="cardsContainer" v-else class="nearby-map-page__cards" :aria-label="t('pages.searchNearby.resultsAriaLabel')">
          <NearbyResultCard
            v-for="item in displayCardItems"
            :key="item.id"
            class="nearby-map-page__card"
            :data-result-card-id="item.id"
            :item="item"
            :active="selectedItemId === item.id || (!selectedItemId && item.id === displayCardItems[0]?.id)"
            @select="selectItem"
            @focus-origin="focusOrigin"
            @directions="handleDirectionsRequest"
          />
        </div>
      </div>
    </div>

    <div v-else class="nearby-map-page__permission">
      <div class="nearby-map-page__permission-card">
        <span class="nearby-map-page__permission-icon">
          <UIcon
            :name="locationPermissionState === 'checking'
              ? 'i-ph-spinner-gap-duotone'
              : locationPermissionState === 'denied' || locationPermissionState === 'unsupported'
                ? 'i-ph-warning-circle-duotone'
                : 'i-ph-map-pin-line-duotone'"
            :class="{ 'nearby-map-page__spin': locationPermissionState === 'checking' }"
          />
        </span>
        <h1>{{ locationPermissionTitle }}</h1>
        <p>{{ locationPermissionDescription }}</p>
        <div v-if="locationPermissionState === 'denied'" class="nearby-map-page__permission-buttons">
          <button
            type="button"
            class="nearby-map-page__permission-action"
            @click="handleMyLocationClick"
          >
            <UIcon name="i-ph-arrow-counter-clockwise-bold" />
            <span>{{ t("pages.searchNearby.permissionRetry") }}</span>
          </button>

          <button
            type="button"
            class="nearby-map-page__guide-toggle"
            :class="{ 'nearby-map-page__guide-toggle--active': showGuide }"
            @click="showGuide = !showGuide"
          >
            <UIcon :name="showGuide ? 'i-ph-eye-slash-bold' : 'i-ph-info-bold'" />
            <span>{{ showGuide ? t("pages.searchNearby.hideLocationGuide") : t("pages.searchNearby.showLocationGuide") }}</span>
          </button>
        </div>

        <!-- Hướng dẫn chi tiết thiết kế Premium -->
        <div v-if="locationPermissionState === 'denied' && showGuide" class="nearby-map-page__guide-card">
          <!-- Guide Tabs -->
          <div class="nearby-map-page__guide-tabs">
            <button
              type="button"
              class="nearby-map-page__guide-tab"
              :class="{ 'nearby-map-page__guide-tab--active': guideTab === 'ios' }"
              @click="guideTab = 'ios'"
            >
              <UIcon name="i-ph-apple-logo-fill" />
              <span>{{ t("pages.searchNearby.iosTab") }}</span>
            </button>
            <button
              type="button"
              class="nearby-map-page__guide-tab"
              :class="{ 'nearby-map-page__guide-tab--active': guideTab === 'android' }"
              @click="guideTab = 'android'"
            >
              <UIcon name="i-ph-android-logo-fill" />
              <span>{{ t("pages.searchNearby.androidTab") }}</span>
            </button>
            <button
              type="button"
              class="nearby-map-page__guide-tab"
              :class="{ 'nearby-map-page__guide-tab--active': guideTab === 'desktop' }"
              @click="guideTab = 'desktop'"
            >
              <UIcon name="i-ph-desktop-fill" />
              <span>{{ t("pages.searchNearby.desktopTab") }}</span>
            </button>
          </div>

          <!-- Guide Steps Content -->
          <div class="nearby-map-page__guide-content">
            <!-- iOS Guide -->
            <div v-if="guideTab === 'ios'" class="nearby-map-page__guide-steps">
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--ios">1</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.ios.step1") }}</div>
              </div>
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--ios">2</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.ios.step2") }}</div>
              </div>
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--ios">3</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.ios.step3") }}</div>
              </div>
            </div>

            <!-- Android Guide -->
            <div v-if="guideTab === 'android'" class="nearby-map-page__guide-steps">
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--android">1</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.android.step1") }}</div>
              </div>
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--android">2</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.android.step2") }}</div>
              </div>
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--android">3</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.android.step3") }}</div>
              </div>
            </div>

            <!-- Desktop Guide -->
            <div v-if="guideTab === 'desktop'" class="nearby-map-page__guide-steps">
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--desktop">1</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.desktop.step1") }}</div>
              </div>
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--desktop">2</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.desktop.step2") }}</div>
              </div>
              <div class="nearby-map-page__step">
                <div class="nearby-map-page__step-badge nearby-map-page__step-badge--desktop">3</div>
                <div class="nearby-map-page__step-text">{{ t("pages.searchNearby.permissionGuide.desktop.step3") }}</div>
              </div>
            </div>
          </div>
        </div>
        <button
          v-else-if="locationPermissionState === 'unsupported'"
          type="button"
          class="nearby-map-page__permission-action"
          disabled
        >
          <UIcon name="i-ph-x-circle-bold" />
          <span>{{ t("pages.searchNearby.unsupported") }}</span>
        </button>
        <button
          v-else
          type="button"
          class="nearby-map-page__permission-action"
          :disabled="locationPermissionState === 'checking'"
          @click="handleMyLocationClick"
        >
          <UIcon name="i-ph-crosshair-fill" />
          <span>{{ t("pages.searchNearby.enableLocation") }}</span>
        </button>
        <p v-if="locationPermissionState !== 'unsupported'" class="nearby-map-page__permission-note">
          {{ t("pages.searchNearby.permissionNote") }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NearbyResultCard from "../components/NearbyResultCard.vue"
import NearbySearchMap from "../components/NearbySearchMap.vue"
import { useSearchNearbyPageVM } from "../../application/view-models/useSearchNearbyPageVM"
import type { NearbySearchItem } from "../../domain/types/search-nearby.types"

type NearbySuggestionOption = {
  id: string
  label: string
  raw: NearbySearchItem | null
  distanceLabel: string
  kind: "nearby" | "place"
  placeId?: string
  distanceMeters?: number | null
}

type GooglePlaceSuggestion = {
  id: string
  label: string
  secondaryText: string
  placeId: string
  distanceMeters: number | null
}

type SearchNearbyConfigResponse = {
  googlePlacesEnabled?: boolean
}

function compareDistance(
  left: { distanceMeters?: number | null, label: string },
  right: { distanceMeters?: number | null, label: string },
) {
  const leftDistance = left.distanceMeters ?? Number.POSITIVE_INFINITY
  const rightDistance = right.distanceMeters ?? Number.POSITIVE_INFINITY

  if (leftDistance !== rightDistance) {
    return leftDistance - rightDistance
  }

  return left.label.localeCompare(right.label)
}

type LocationPermissionState = "checking" | "granted" | "denied" | "unsupported"
type LiveLocationSnapshot = { lat: number, lng: number, heading: number | null, updatedAt: number }
type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}
type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: (absolute?: boolean) => Promise<PermissionState>
}

const liveMarkerMinDistanceMeters = 1.5
const liveHeadingMinDegrees = 1.5
const deviceHeadingMinIntervalMs = 80
const deviceHeadingSmoothingAlpha = 0.32
const deviceCompassMaxAccuracyDegrees = 55
const routeRefreshMinDistanceMeters = 15
const routeRefreshMinIntervalMs = 10000
const searchOriginRefreshMinDistanceMeters = 100
const locationPollIntervalMs = 2000
const locationWatchStaleMs = 6000
const gpsMaxUsableAccuracyMeters = 120
const gpsJitterMinDistanceMeters = 2.5
const gpsJitterAccuracyRatio = 0.38
const gpsJumpRejectMeters = 220
const gpsSmoothAlphaWalking = 0.34
const gpsSmoothAlphaDriving = 0.56
const routeArrivalMinDistanceMeters = 25
const routeArrivalMaxDistanceMeters = 60
const routeArrivalAccuracyMultiplier = 1.2
const geolocationOptions: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10000,
}

const {
  appRoutes,
  searchText,
  selectedItemId,
  routeTargetItem,
  routeNavigationActive,
  routeErrorMessage,
  originFocusKey,
  originUpdateKey,
  routeOriginUpdateKey,
  routeFitKey,
  distanceKm,
  hasSharedOrigin,
  origin,
  mapItems,
  cardItems,
  suggestions,
  suggestionsLoading,
  displayLoading,
  errorMessage,
  hasOrigin,
  needsLocation,
  emptyTitle,
  emptyDescription,
  refresh,
  refreshSuggestions,
  selectItem,
  selectSuggestion,
  requestDirections,
  clearRoute,
  handleRouteError,
  focusOrigin,
  focusDeviceLocation,
  updateLiveDeviceLocation,
  clearSearch,
} = useSearchNearbyPageVM()

const { t } = useI18n()

const searchPlaceholder = computed(() =>
  googlePlacesEnabled.value
    ? t("pages.searchNearby.searchPlacesPlaceholder")
    : t("pages.searchNearby.searchPeoplePagesPlaceholder"),
)

const googlePlaceSuggestions = ref<GooglePlaceSuggestion[]>([])
const googlePlacesLoading = ref(false)
const googleNearbyResults = ref<NearbySearchItem[]>([])
const googleNearbyLoading = ref(false)
const googleNearbyQuery = ref("")
const googlePlacesEnabled = ref(true)
const googleNearbyRadiusMeters = 3000
const googleNearbyLimit = 20
const autocompleteService = shallowRef<google.maps.places.AutocompleteService | null>(null)
const placesService = shallowRef<google.maps.places.PlacesService | null>(null)
const googlePlaceRequestId = ref(0)
const googleNearbyRequestId = ref(0)
const isSuggestionPanelOpen = ref(false)
const pageRoot = ref<HTMLElement | null>(null)
const cardsContainer = ref<HTMLElement | null>(null)
const mapZoomInKey = ref(0)
const mapZoomOutKey = ref(0)
const locationPermissionState = ref<LocationPermissionState>("checking")
const liveOriginHeading = ref<number | null>(null)
const showGuide = ref(false)
const showMapGuide = ref(false)
const guideTab = ref<"ios" | "android" | "desktop">("ios")
let searchBlurTimer: ReturnType<typeof setTimeout> | null = null
let locationWatchId: number | null = null
let locationPollTimer: ReturnType<typeof setInterval> | null = null
let locationPollInFlight = false
let lastLocationCallbackAt = 0
let deviceOrientationListener: ((event: DeviceOrientationEvent) => void) | null = null
let deviceOrientationPermissionRequested = false
let lastDeviceHeadingUpdateAt = 0
let smoothedDeviceHeading: number | null = null
let shouldFocusNextLocationUpdate = false
let lastLiveLocation: LiveLocationSnapshot | null = null
let lastRouteLocation: LiveLocationSnapshot | null = null
let lastSearchOriginLocation: LiveLocationSnapshot | null = null
let smoothedLiveLocation: { lat: number, lng: number } | null = null

const { load: loadGoogleMaps } = useScriptGoogleMaps({
  libraries: ["places", "routes"],
  trigger: "manual",
})

const suggestionOptions = computed<NearbySuggestionOption[]>(() =>
  [
    ...suggestions.value.map(item => ({
      id: item.id,
      label: item.title,
      raw: item,
      distanceLabel: formatDistance(item.distanceMeters),
      kind: "nearby" as const,
      distanceMeters: item.distanceMeters,
    })),
    ...(googlePlacesEnabled.value ? googlePlaceSuggestions.value : []).map(item => ({
      id: item.id,
      label: item.label,
      raw: null,
      distanceLabel: [
        item.distanceMeters === null ? "" : formatDistance(item.distanceMeters),
        item.secondaryText,
      ].filter(Boolean).join(" · "),
      kind: "place" as const,
      placeId: item.placeId,
      distanceMeters: item.distanceMeters,
    })),
  ].sort(compareDistance),
)

const showSuggestionPanel = computed(() =>
  isSuggestionPanelOpen.value
  && (searchText.value.trim().length > 0 || suggestionOptions.value.length > 0),
)
const canUseNearbyMap = computed(() =>
  hasOrigin.value
  || (locationPermissionState.value !== "denied" && locationPermissionState.value !== "unsupported"),
)
const shouldShowGoogleNearbyResults = computed(() =>
  googleNearbyLoading.value || googleNearbyQuery.value.length > 0,
)

function mergeNearbyDisplayItems(primaryItems: NearbySearchItem[], googleItems: NearbySearchItem[]) {
  const merged = new Map<string, NearbySearchItem>()

  primaryItems.forEach((item) => {
    merged.set(item.id, item)
  })
  googleItems.forEach((item) => {
    merged.set(item.id, item)
  })

  return Array.from(merged.values()).sort((left, right) => {
    const leftDistance = left.distanceMeters ?? Number.POSITIVE_INFINITY
    const rightDistance = right.distanceMeters ?? Number.POSITIVE_INFINITY

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance
    }

    return left.title.localeCompare(right.title)
  })
}

const displayMapItems = computed(() =>
  shouldShowGoogleNearbyResults.value
    ? mergeNearbyDisplayItems(mapItems.value, googleNearbyResults.value)
    : mapItems.value,
)
const displayCardItems = computed(() =>
  shouldShowGoogleNearbyResults.value
    ? mergeNearbyDisplayItems(cardItems.value, googleNearbyResults.value)
    : cardItems.value,
)
const displayHasResults = computed(() => displayCardItems.value.length > 0)
const displayLoadingState = computed(() => displayLoading.value || googleNearbyLoading.value)
const showNearbySkeleton = computed(() =>
  displayLoadingState.value
  || (
    needsLocation.value
    && !hasOrigin.value
    && locationPermissionState.value === "checking"
  ),
)
const displaySearchRadiusKm = computed(() =>
  shouldShowGoogleNearbyResults.value ? 3 : distanceKm.value,
)
const locationPermissionTitle = computed(() => {
  if (locationPermissionState.value === "checking") return t("pages.searchNearby.permissionTitleChecking")
  if (locationPermissionState.value === "denied") return t("pages.searchNearby.permissionTitleDenied")
  if (locationPermissionState.value === "unsupported") return t("pages.searchNearby.permissionTitleUnsupported")
  return t("pages.searchNearby.permissionTitleDefault")
})
const locationPermissionDescription = computed(() => {
  if (locationPermissionState.value === "unsupported") {
    return t("pages.searchNearby.permissionDescriptionUnsupported")
  }

  if (locationPermissionState.value === "checking") {
    return t("pages.searchNearby.permissionDescriptionChecking")
  }

  if (locationPermissionState.value === "denied") {
    return t("pages.searchNearby.permissionDescriptionDenied")
  }

  return t("pages.searchNearby.permissionDescriptionDefault")
})

const suggestionEmptyText = computed(() => {
  if (suggestionsLoading.value) return t("pages.searchNearby.suggestionLoading")
  if (searchText.value.trim().length < 3) return t("pages.searchNearby.suggestionMinChars")

  return t("pages.searchNearby.suggestionEmpty")
})

function getSuggestionMeta(item: NearbySuggestionOption) {
  if (item.kind === "place") {
    return item.distanceLabel
  }

  const typeLabel = item.raw?.type === "page"
    ? t("pages.searchNearby.suggestionPage")
    : t("pages.searchNearby.suggestionUser")

  return `${typeLabel} · ${item.distanceLabel}`
}

function formatDistance(meters: number | null) {
  if (meters === null) return "-- km"
  if (meters < 1000) return `${meters} m`

  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`
}

function calculateDistanceMeters(lat: number, lng: number) {
  if (origin.value.lat === null || origin.value.lng === null) {
    return null
  }

  const earthRadiusMeters = 6371000
  const toRad = (value: number) => value * Math.PI / 180
  const latFrom = toRad(origin.value.lat)
  const lngFrom = toRad(origin.value.lng)
  const latTo = toRad(lat)
  const lngTo = toRad(lng)
  const latDelta = latTo - latFrom
  const lngDelta = lngTo - lngFrom
  const angle = 2 * Math.asin(Math.sqrt(
    Math.sin(latDelta / 2) ** 2
    + Math.cos(latFrom) * Math.cos(latTo) * Math.sin(lngDelta / 2) ** 2,
  ))

  return Math.round(earthRadiusMeters * angle)
}

function createGoogleMapsHref(placeId: string, address: string) {
  return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}&query=${encodeURIComponent(address)}`
}

function googlePlaceToNearbyItem(
  place: google.maps.places.PlaceResult,
  index: number,
  restrictToSearchRadius = true,
): NearbySearchItem | null {
  const location = place.geometry?.location

  if (!location) {
    return null
  }

  const lat = location.lat()
  const lng = location.lng()
  const distanceMeters = calculateDistanceMeters(lat, lng)

  if (restrictToSearchRadius && distanceMeters !== null && distanceMeters > googleNearbyRadiusMeters) {
    return null
  }

  const title = String(place.name || place.formatted_address || place.vicinity || "Google Maps").trim()
  const address = String(place.vicinity || place.formatted_address || title).trim()
  const placeId = String(place.place_id || `${lat},${lng}`)
  const placeIconUrl = typeof place.icon === "string" ? place.icon : ""
  const placeMaskIconUrl = typeof place.icon_mask_base_uri === "string"
    ? `${place.icon_mask_base_uri}.svg`
    : placeIconUrl
  const placeIconBackgroundColor = typeof place.icon_background_color === "string"
    ? place.icon_background_color
    : ""

  return {
    id: `place-${placeId}-${index}`,
    backendId: 0,
    type: "place",
    title,
    subtitle: "Google Maps",
    description: "",
    locationLabel: address,
    avatarUrl: placeIconUrl,
    mapIconUrl: placeMaskIconUrl,
    mapIconBackgroundColor: placeIconBackgroundColor,
    href: createGoogleMapsHref(placeId, address),
    lat,
    lng,
    distanceMeters,
  }
}

function calculatePointDistanceMeters(from: { lat: number, lng: number }, to: { lat: number, lng: number }) {
  const earthRadiusMeters = 6371000
  const toRad = (value: number) => value * Math.PI / 180
  const latFrom = toRad(from.lat)
  const lngFrom = toRad(from.lng)
  const latTo = toRad(to.lat)
  const lngTo = toRad(to.lng)
  const latDelta = latTo - latFrom
  const lngDelta = lngTo - lngFrom
  const angle = 2 * Math.asin(Math.sqrt(
    Math.sin(latDelta / 2) ** 2
    + Math.cos(latFrom) * Math.cos(latTo) * Math.sin(lngDelta / 2) ** 2,
  ))

  return earthRadiusMeters * angle
}

function normalizeHeading(heading: number | null) {
  if (typeof heading !== "number" || !Number.isFinite(heading)) {
    return null
  }

  return (heading % 360 + 360) % 360
}

function calculateHeadingDelta(left: number, right: number) {
  const delta = Math.abs(left - right) % 360

  return Math.min(delta, 360 - delta)
}

function interpolateHeading(from: number, to: number, alpha: number) {
  const start = normalizeHeading(from) ?? 0
  const end = normalizeHeading(to) ?? start
  const clockwiseDelta = (end - start + 360) % 360
  const signedDelta = clockwiseDelta > 180 ? clockwiseDelta - 360 : clockwiseDelta

  return normalizeHeading(start + signedDelta * Math.max(0, Math.min(1, alpha))) ?? end
}

function calculateBearingDegrees(from: { lat: number, lng: number }, to: { lat: number, lng: number }) {
  const toRad = (value: number) => value * Math.PI / 180
  const toDeg = (value: number) => value * 180 / Math.PI
  const latFrom = toRad(from.lat)
  const latTo = toRad(to.lat)
  const lngDelta = toRad(to.lng - from.lng)
  const y = Math.sin(lngDelta) * Math.cos(latTo)
  const x = Math.cos(latFrom) * Math.sin(latTo)
    - Math.sin(latFrom) * Math.cos(latTo) * Math.cos(lngDelta)

  return normalizeHeading(toDeg(Math.atan2(y, x)))
}

function interpolateLocation(
  from: { lat: number, lng: number },
  to: { lat: number, lng: number },
  alpha: number,
) {
  const clampedAlpha = Math.max(0, Math.min(1, alpha))

  return {
    lat: from.lat + (to.lat - from.lat) * clampedAlpha,
    lng: from.lng + (to.lng - from.lng) * clampedAlpha,
  }
}

function resolveStableLocation(position: GeolocationPosition, rawLocation: { lat: number, lng: number }) {
  const accuracy = Number(position.coords.accuracy || 0)
  const speed = typeof position.coords.speed === "number" && Number.isFinite(position.coords.speed)
    ? Math.max(0, position.coords.speed)
    : 0
  const shouldForce = shouldFocusNextLocationUpdate || !lastLiveLocation

  if (!shouldForce && accuracy > gpsMaxUsableAccuracyMeters) {
    return null
  }

  if (!shouldForce && lastLiveLocation) {
    const movedMeters = calculatePointDistanceMeters(lastLiveLocation, rawLocation)
    const jitterThreshold = Math.max(gpsJitterMinDistanceMeters, accuracy * gpsJitterAccuracyRatio)

    if (movedMeters < jitterThreshold) {
      return null
    }

    if (movedMeters > gpsJumpRejectMeters && accuracy > 45) {
      return null
    }
  }

  if (shouldForce || !smoothedLiveLocation) {
    smoothedLiveLocation = rawLocation
    return rawLocation
  }

  const baseAlpha = routeNavigationActive.value || speed > 2
    ? gpsSmoothAlphaDriving
    : gpsSmoothAlphaWalking
  const accuracyPenalty = accuracy > 35 ? 0.7 : 1
  const nextLocation = interpolateLocation(
    smoothedLiveLocation,
    rawLocation,
    baseAlpha * accuracyPenalty,
  )

  smoothedLiveLocation = nextLocation

  return nextLocation
}

function getRouteArrivalThresholdMeters(position: GeolocationPosition) {
  const accuracy = Number(position.coords.accuracy || 0)

  if (!Number.isFinite(accuracy) || accuracy <= 0) {
    return routeArrivalMinDistanceMeters
  }

  return Math.max(
    routeArrivalMinDistanceMeters,
    Math.min(routeArrivalMaxDistanceMeters, accuracy * routeArrivalAccuracyMultiplier),
  )
}

function hasArrivedAtRouteTarget(position: GeolocationPosition, nextLocation: { lat: number, lng: number }) {
  const target = routeTargetItem.value
  const accuracy = Number(position.coords.accuracy || 0)

  if (!routeNavigationActive.value || !target || target.lat === null || target.lng === null) {
    return false
  }

  if (Number.isFinite(accuracy) && accuracy > gpsMaxUsableAccuracyMeters) {
    return false
  }

  const distanceToTarget = calculatePointDistanceMeters(nextLocation, {
    lat: target.lat,
    lng: target.lng,
  })

  return distanceToTarget <= getRouteArrivalThresholdMeters(position)
}

function getScreenOrientationAngle() {
  if (!import.meta.client) {
    return 0
  }

  const legacyWindow = window as Window & { orientation?: number }

  return Number(screen.orientation?.angle ?? legacyWindow.orientation ?? 0)
}

function calculateAbsoluteCompassHeading(event: DeviceOrientationEventWithCompass) {
  if (
    typeof event.alpha !== "number"
    || !Number.isFinite(event.alpha)
  ) {
    return null
  }

  if (
    typeof event.beta !== "number"
    || !Number.isFinite(event.beta)
    || typeof event.gamma !== "number"
    || !Number.isFinite(event.gamma)
  ) {
    return normalizeHeading(360 - event.alpha)
  }

  const degreesToRadians = Math.PI / 180
  const alpha = event.alpha * degreesToRadians
  const beta = event.beta * degreesToRadians
  const gamma = event.gamma * degreesToRadians
  const compassX = -Math.cos(alpha) * Math.sin(gamma)
    - Math.sin(alpha) * Math.sin(beta) * Math.cos(gamma)
  const compassY = -Math.sin(alpha) * Math.sin(gamma)
    + Math.cos(alpha) * Math.sin(beta) * Math.cos(gamma)

  if (Math.hypot(compassX, compassY) < 0.0001) {
    return normalizeHeading(360 - event.alpha)
  }

  return normalizeHeading(Math.atan2(compassX, compassY) * 180 / Math.PI)
}

function resolveDeviceOrientationHeading(event: DeviceOrientationEventWithCompass) {
  const compassHeading = normalizeHeading(event.webkitCompassHeading ?? null)

  if (compassHeading !== null) {
    const compassAccuracy = Number(event.webkitCompassAccuracy)

    if (Number.isFinite(compassAccuracy) && Math.abs(compassAccuracy) > deviceCompassMaxAccuracyDegrees) {
      return null
    }

    return normalizeHeading(compassHeading - getScreenOrientationAngle())
  }

  const hasAbsoluteReference = event.type === "deviceorientationabsolute" || event.absolute === true

  if (hasAbsoluteReference) {
    const absoluteHeading = calculateAbsoluteCompassHeading(event)

    return absoluteHeading === null
      ? null
      : normalizeHeading(absoluteHeading - getScreenOrientationAngle())
  }

  return null
}

function shouldRefreshFromLocation(
  lastLocation: LiveLocationSnapshot | null,
  nextLocation: { lat: number, lng: number },
  minDistanceMeters: number,
  minIntervalMs = 0,
) {
  if (!lastLocation) {
    return true
  }

  const now = Date.now()
  const movedMeters = calculatePointDistanceMeters(lastLocation, nextLocation)

  return movedMeters >= minDistanceMeters
    && (!minIntervalMs || now - lastLocation.updatedAt >= minIntervalMs)
}

function resolvePositionHeading(
  position: GeolocationPosition,
  nextLocation: { lat: number, lng: number },
) {
  const nativeHeading = normalizeHeading(position.coords.heading)
  const speed = typeof position.coords.speed === "number" && Number.isFinite(position.coords.speed)
    ? Math.max(0, position.coords.speed)
    : 0

  if (nativeHeading !== null && speed >= 0.8) {
    return nativeHeading
  }

  if (
    lastLiveLocation
    && calculatePointDistanceMeters(lastLiveLocation, nextLocation) >= liveMarkerMinDistanceMeters
  ) {
    return calculateBearingDegrees(lastLiveLocation, nextLocation)
  }

  return liveOriginHeading.value
}

function shouldRefreshHeading(nextHeading: number | null) {
  if (nextHeading === null) {
    return false
  }

  if (liveOriginHeading.value === null) {
    return true
  }

  return calculateHeadingDelta(liveOriginHeading.value, nextHeading) >= liveHeadingMinDegrees
}

function updateLiveHeading(nextHeading: number | null) {
  if (nextHeading !== null && shouldRefreshHeading(nextHeading)) {
    liveOriginHeading.value = nextHeading
  }
}

function handleDeviceOrientation(event: DeviceOrientationEvent) {
  if (routeNavigationActive.value) {
    lastDeviceHeadingUpdateAt = 0
    smoothedDeviceHeading = null
    return
  }

  const nextHeading = resolveDeviceOrientationHeading(event)

  if (nextHeading === null) {
    return
  }

  const now = performance.now()

  if (now - lastDeviceHeadingUpdateAt < deviceHeadingMinIntervalMs) {
    return
  }

  smoothedDeviceHeading = smoothedDeviceHeading === null
    ? nextHeading
    : interpolateHeading(smoothedDeviceHeading, nextHeading, deviceHeadingSmoothingAlpha)
  lastDeviceHeadingUpdateAt = now
  updateLiveHeading(smoothedDeviceHeading)
}

async function startDeviceOrientationTracking(requestPermission = false) {
  if (!import.meta.client || !("DeviceOrientationEvent" in window)) {
    return
  }

  const OrientationEvent = window.DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission

  if (typeof OrientationEvent.requestPermission === "function" && !deviceOrientationPermissionRequested) {
    if (!requestPermission) {
      return
    }

    try {
      const permission = await OrientationEvent.requestPermission(true)
      deviceOrientationPermissionRequested = true

      if (permission !== "granted") {
        return
      }
    }
    catch {
      return
    }
  }

  if (deviceOrientationListener) {
    return
  }

  deviceOrientationListener = handleDeviceOrientation
  window.addEventListener("deviceorientationabsolute", deviceOrientationListener as EventListener, true)
  window.addEventListener("deviceorientation", deviceOrientationListener, true)
}

function stopDeviceOrientationTracking() {
  if (!import.meta.client || !deviceOrientationListener) {
    return
  }

  window.removeEventListener("deviceorientationabsolute", deviceOrientationListener as EventListener, true)
  window.removeEventListener("deviceorientation", deviceOrientationListener, true)
  deviceOrientationListener = null
  lastDeviceHeadingUpdateAt = 0
  smoothedDeviceHeading = null
}

function rememberLocation(
  nextLocation: { lat: number, lng: number },
  heading: number | null,
): LiveLocationSnapshot {
  return {
    ...nextLocation,
    heading,
    updatedAt: Date.now(),
  }
}

function handleLocationPosition(position: GeolocationPosition) {
  lastLocationCallbackAt = Date.now()
  const rawLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  }
  const nextLocation = resolveStableLocation(position, rawLocation)

  locationPermissionState.value = "granted"

  if (!nextLocation) {
    return
  }

  const nextHeading = resolvePositionHeading(position, nextLocation)
  const arrivedAtRouteTarget = hasArrivedAtRouteTarget(position, nextLocation)

  if (arrivedAtRouteTarget) {
    clearRoute()
  }

  const shouldFocus = shouldFocusNextLocationUpdate || !lastLiveLocation
  const shouldUpdateLiveMarker = shouldRefreshFromLocation(
    lastLiveLocation,
    nextLocation,
    liveMarkerMinDistanceMeters,
  )
  const shouldRefreshSearchOrigin = shouldRefreshFromLocation(
    lastSearchOriginLocation,
    nextLocation,
    searchOriginRefreshMinDistanceMeters,
  )
  const shouldRefreshRoute = !arrivedAtRouteTarget
    && Boolean(routeTargetItem.value)
    && shouldRefreshFromLocation(
      lastRouteLocation,
      nextLocation,
      routeRefreshMinDistanceMeters,
      routeRefreshMinIntervalMs,
    )
  const shouldUpdateHeading = shouldRefreshHeading(nextHeading)

  if (
    !shouldFocus
    && !shouldUpdateLiveMarker
    && !shouldRefreshSearchOrigin
    && !shouldRefreshRoute
    && !shouldUpdateHeading
    && !arrivedAtRouteTarget
  ) {
    return
  }

  const nextSnapshot = rememberLocation(nextLocation, nextHeading)
  const shouldUpdatePosition = shouldFocus
    || shouldUpdateLiveMarker
    || shouldRefreshSearchOrigin
    || shouldRefreshRoute
    || arrivedAtRouteTarget

  if (shouldUpdatePosition) {
    lastLiveLocation = nextSnapshot
    shouldFocusNextLocationUpdate = false
  }

  if (shouldFocus || shouldUpdateLiveMarker || shouldUpdateHeading) {
    updateLiveHeading(nextHeading)
  }

  if (!shouldUpdatePosition) {
    return
  }

  if (shouldFocus) {
    lastSearchOriginLocation = nextSnapshot
    lastRouteLocation = nextSnapshot
    if (routeTargetItem.value) {
      updateLiveDeviceLocation(nextLocation.lat, nextLocation.lng, {
        updateSearchOrigin: true,
        redrawRoute: true,
      })
      return
    }
    focusDeviceLocation(nextLocation.lat, nextLocation.lng)
    return
  }

  if (shouldRefreshSearchOrigin) {
    lastSearchOriginLocation = nextSnapshot
  }

  if (shouldRefreshRoute) {
    lastRouteLocation = nextSnapshot
  }

  if (arrivedAtRouteTarget) {
    lastRouteLocation = nextSnapshot
  }

  if (!shouldUpdateLiveMarker && !shouldRefreshSearchOrigin && !shouldRefreshRoute && !arrivedAtRouteTarget) {
    return
  }

  updateLiveDeviceLocation(nextLocation.lat, nextLocation.lng, {
    updateSearchOrigin: shouldRefreshSearchOrigin,
    redrawRoute: shouldRefreshRoute,
  })
}

function handleLocationError(error?: GeolocationPositionError) {
  if (error?.code === 1) {
    locationPermissionState.value = hasOrigin.value ? "granted" : "denied"
    if (locationWatchId !== null && import.meta.client && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchId)
      locationWatchId = null
    }
    stopLocationPolling()
    return
  }

  locationPermissionState.value = hasOrigin.value ? "granted" : "checking"
}

function stopLocationPolling() {
  if (locationPollTimer) {
    clearInterval(locationPollTimer)
    locationPollTimer = null
  }
  locationPollInFlight = false
}

function pollCurrentLocation() {
  if (!import.meta.client || !navigator.geolocation) {
    return
  }

  if (
    locationPollInFlight
    || (
      locationWatchId !== null
      && lastLocationCallbackAt > 0
      && Date.now() - lastLocationCallbackAt < locationWatchStaleMs
    )
  ) {
    return
  }

  locationPollInFlight = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationPollInFlight = false
      handleLocationPosition(position)
    },
    (error) => {
      locationPollInFlight = false
      handleLocationError(error)
    },
    geolocationOptions,
  )
}

function startLocationPolling() {
  if (locationPollTimer || !import.meta.client || !navigator.geolocation) {
    return
  }

  locationPollTimer = setInterval(pollCurrentLocation, locationPollIntervalMs)
}

function handleSuggestionSelect(option: NearbySuggestionOption | null) {
  if (!option) {
    return
  }

  isSuggestionPanelOpen.value = false

  if (option.kind === "place" && option.placeId && googlePlacesEnabled.value) {
    void selectGooglePlace(option)
    return
  }

  if (option.raw) {
    clearGoogleNearbyResults()
    selectSuggestion(option.raw)
  }
}

function handleSearchFocus() {
  if (searchBlurTimer) {
    clearTimeout(searchBlurTimer)
    searchBlurTimer = null
  }

  isSuggestionPanelOpen.value = true
  void refreshSuggestions()
  if (googlePlacesEnabled.value) {
    void refreshGooglePlaceSuggestions()
  }
}

function handleSearchInput() {
  isSuggestionPanelOpen.value = true
}

function handleSearchBlur() {
  searchBlurTimer = setTimeout(() => {
    isSuggestionPanelOpen.value = false
  }, 120)
}

function handleSearchEnter() {
  if (!googlePlacesEnabled.value) {
    const firstNearbyOption = suggestionOptions.value.find(option => option.kind === "nearby")
    handleSuggestionSelect(firstNearbyOption ?? null)
    return
  }

  void searchGoogleNearbyPlaces(searchText.value)
}

function handleClearSearch() {
  clearGoogleNearbyResults()
  clearSearch()
}

async function loadSearchNearbyConfig() {
  try {
    const response = await $fetch<SearchNearbyConfigResponse>("/_api/search-nearby/config")
    googlePlacesEnabled.value = response.googlePlacesEnabled !== false
  }
  catch {
    googlePlacesEnabled.value = true
  }

  if (!googlePlacesEnabled.value) {
    googlePlaceSuggestions.value = []
    googlePlacesLoading.value = false
    googleNearbyLoading.value = false
    clearGoogleNearbyResults()
  }
}

function scrollSelectedResultCardIntoView() {
  if (!import.meta.client || !selectedItemId.value || !cardsContainer.value) {
    return
  }

  const selectedCard = Array.from(
    cardsContainer.value.querySelectorAll<HTMLElement>("[data-result-card-id]"),
  ).find(card => card.dataset.resultCardId === selectedItemId.value)

  selectedCard?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest",
  })
}

function handleDirectionsRequest(item: NearbySearchItem) {
  requestDirections(item)

  if (!import.meta.client || !window.matchMedia("(max-width: 760px)").matches) {
    return
  }

  shouldFocusNextLocationUpdate = true
  if (navigator.geolocation) {
    pollCurrentLocation()
  }
}

function zoomMapIn() {
  mapZoomInKey.value += 1
}

function zoomMapOut() {
  mapZoomOutKey.value += 1
}

async function toggleMapFullscreen() {
  if (!import.meta.client || !pageRoot.value) {
    return
  }

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await pageRoot.value.requestFullscreen()
  }
  catch {
    handleRouteError(t("pages.searchNearby.fullscreenError"))
  }
}

async function requestLocationPermission(options: { forceFocus?: boolean, requestDeviceHeadingPermission?: boolean } = {}) {
  if (!import.meta.client || !navigator.geolocation) {
    locationPermissionState.value = hasOrigin.value ? "granted" : "unsupported"
    return
  }

  void startDeviceOrientationTracking(options.requestDeviceHeadingPermission === true)

  try {
    const permission = await navigator.permissions?.query?.({ name: "geolocation" as PermissionName })

    if (permission?.state === "denied") {
      locationPermissionState.value = "denied"
      if (!hasOrigin.value) {
        return
      }
    }
  }
  catch {
    // Some mobile browsers do not support the Permissions API; getCurrentPosition will still trigger the prompt.
  }

  if (locationPermissionState.value !== "granted") {
    locationPermissionState.value = "checking"
  }
  shouldFocusNextLocationUpdate = shouldFocusNextLocationUpdate || options.forceFocus === true || !hasOrigin.value

  if (locationWatchId !== null) {
    locationPermissionState.value = "granted"
    if (hasOrigin.value && options.forceFocus === true) {
      focusOrigin()
    }
    startLocationPolling()
    pollCurrentLocation()
    return
  }

  locationWatchId = navigator.geolocation.watchPosition(
    handleLocationPosition,
    handleLocationError,
    geolocationOptions,
  )
  startLocationPolling()
  pollCurrentLocation()
}

function handleMyLocationClick() {
  void requestLocationPermission({
    forceFocus: true,
    requestDeviceHeadingPermission: true,
  })
}

async function ensureGooglePlacesServices() {
  if (autocompleteService.value && placesService.value) {
    return true
  }

  if (!import.meta.client) {
    return false
  }

  await loadGoogleMaps()

  const maps = window.google?.maps
  if (!maps?.places?.AutocompleteService || !maps.places.PlacesService) {
    return false
  }

  autocompleteService.value = new maps.places.AutocompleteService()
  placesService.value = new maps.places.PlacesService(document.createElement("div"))

  return true
}

async function refreshGooglePlaceSuggestions() {
  const query = searchText.value.trim()
  const requestId = googlePlaceRequestId.value + 1
  googlePlaceRequestId.value = requestId

  if (!googlePlacesEnabled.value) {
    googlePlaceSuggestions.value = []
    googlePlacesLoading.value = false
    return
  }

  if (!isSuggestionPanelOpen.value || query.length < 3) {
    googlePlaceSuggestions.value = []
    googlePlacesLoading.value = false
    return
  }

  try {
    googlePlacesLoading.value = true
    const ready = await ensureGooglePlacesServices()
    if (!ready || !autocompleteService.value) {
      googlePlaceSuggestions.value = []
      return
    }

    autocompleteService.value.getPlacePredictions(
      {
        input: query,
        location: origin.value.lat !== null && origin.value.lng !== null
          ? new window.google.maps.LatLng(origin.value.lat, origin.value.lng)
          : undefined,
        origin: origin.value.lat !== null && origin.value.lng !== null
          ? new window.google.maps.LatLng(origin.value.lat, origin.value.lng)
          : undefined,
        radius: origin.value.lat !== null && origin.value.lng !== null ? distanceKm.value * 1000 : undefined,
      },
      (predictions, status) => {
        if (requestId !== googlePlaceRequestId.value) {
          return
        }

        const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK
        const predictedPlaces = status === okStatus
          ? (predictions ?? []).slice(0, 5).map(prediction => ({
              id: `place-${prediction.place_id || prediction.description}`,
              label: prediction.structured_formatting?.main_text || prediction.description,
              secondaryText: prediction.structured_formatting?.secondary_text || prediction.description,
              placeId: prediction.place_id || prediction.description,
              distanceMeters: Number.isFinite(prediction.distance_meters)
                ? Math.round(Number(prediction.distance_meters))
                : null,
            }))
          : []
        const looksLikePlaceId = query.length >= 8 && !/\s/.test(query)
        googlePlaceSuggestions.value = looksLikePlaceId && !predictedPlaces.some(item => item.placeId === query)
          ? [
              {
                id: `place-${query}`,
                label: query,
                secondaryText: "Google place_id",
                placeId: query,
                distanceMeters: null,
              },
              ...predictedPlaces,
            ].slice(0, 5)
          : predictedPlaces
      },
    )
  }
  catch {
    googlePlaceSuggestions.value = []
  }
  finally {
    if (requestId === googlePlaceRequestId.value) {
      googlePlacesLoading.value = false
    }
  }
}

function clearGoogleNearbyResults() {
  googleNearbyResults.value = []
  googleNearbyQuery.value = ""
}

function runGoogleNearbySearch(query: string) {
  return new Promise<google.maps.places.PlaceResult[]>((resolve) => {
    if (!placesService.value || origin.value.lat === null || origin.value.lng === null) {
      resolve([])
      return
    }

    placesService.value.nearbySearch(
      {
        location: new window.google.maps.LatLng(origin.value.lat, origin.value.lng),
        radius: googleNearbyRadiusMeters,
        keyword: query,
      },
      (results, status) => {
        const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK
        const zeroStatus = window.google?.maps?.places?.PlacesServiceStatus?.ZERO_RESULTS

        if (status === okStatus || status === zeroStatus) {
          resolve(results ?? [])
          return
        }

        resolve([])
      },
    )
  })
}

function runGoogleTextSearch(query: string) {
  return new Promise<google.maps.places.PlaceResult[]>((resolve) => {
    if (!placesService.value || origin.value.lat === null || origin.value.lng === null) {
      resolve([])
      return
    }

    placesService.value.textSearch(
      {
        query,
        location: new window.google.maps.LatLng(origin.value.lat, origin.value.lng),
        radius: googleNearbyRadiusMeters,
      },
      (results, status) => {
        const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK
        const zeroStatus = window.google?.maps?.places?.PlacesServiceStatus?.ZERO_RESULTS

        if (status === okStatus || status === zeroStatus) {
          resolve(results ?? [])
          return
        }

        resolve([])
      },
    )
  })
}

function getGooglePlaceDetails(placeId: string) {
  return new Promise<google.maps.places.PlaceResult | null>((resolve) => {
    if (!placesService.value) {
      resolve(null)
      return
    }

    placesService.value.getDetails(
      {
        placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "vicinity",
          "geometry",
          "icon",
          "icon_mask_base_uri",
          "icon_background_color",
        ],
      },
      (place, status) => {
        const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK
        resolve(status === okStatus && place ? place : null)
      },
    )
  })
}

async function searchGoogleNearbyPlaces(rawQuery: string) {
  const query = rawQuery.trim()
  const requestId = googleNearbyRequestId.value + 1
  googleNearbyRequestId.value = requestId

  if (!googlePlacesEnabled.value) {
    googleNearbyLoading.value = false
    clearGoogleNearbyResults()
    return
  }

  if (query.length < 2) {
    clearGoogleNearbyResults()
    return
  }

  try {
    googleNearbyLoading.value = true
    const ready = await ensureGooglePlacesServices()
    if (!ready || !placesService.value) {
      return
    }

    clearRoute()
    selectedItemId.value = ""
    googlePlaceSuggestions.value = []
    isSuggestionPanelOpen.value = false

    const nearbyResults = await runGoogleNearbySearch(query)
    const rawResults = nearbyResults.length > 0 ? nearbyResults : await runGoogleTextSearch(query)

    if (requestId !== googleNearbyRequestId.value) {
      return
    }

    const deduped = new Map<string, NearbySearchItem>()
    rawResults.forEach((place, index) => {
      const item = googlePlaceToNearbyItem(place, index)

      if (!item) {
        return
      }

      const key = String(place.place_id || `${item.lat},${item.lng}`)
      if (!deduped.has(key)) {
        deduped.set(key, item)
      }
    })

    googleNearbyQuery.value = query
    googleNearbyResults.value = Array.from(deduped.values())
      .sort((left, right) => {
        const leftDistance = left.distanceMeters ?? Number.POSITIVE_INFINITY
        const rightDistance = right.distanceMeters ?? Number.POSITIVE_INFINITY

        if (leftDistance !== rightDistance) {
          return leftDistance - rightDistance
        }

        return left.title.localeCompare(right.title)
      })
      .slice(0, googleNearbyLimit)
  }
  catch {
    if (requestId === googleNearbyRequestId.value) {
      clearGoogleNearbyResults()
    }
  }
  finally {
    if (requestId === googleNearbyRequestId.value) {
      googleNearbyLoading.value = false
    }
  }
}

async function selectGooglePlace(option: NearbySuggestionOption) {
  if (!googlePlacesEnabled.value) {
    return
  }

  const selectedLabel = option.label || searchText.value
  searchText.value = selectedLabel
  const placeId = option.placeId?.trim()

  if (!placeId) {
    await searchGoogleNearbyPlaces(selectedLabel)
    const fallbackItem = googleNearbyResults.value[0]
    if (fallbackItem) {
      selectSuggestion(fallbackItem)
    }
    return
  }

  const requestId = googleNearbyRequestId.value + 1
  googleNearbyRequestId.value = requestId
  googleNearbyLoading.value = true
  googlePlaceSuggestions.value = []
  googleNearbyResults.value = []
  googleNearbyQuery.value = ""
  isSuggestionPanelOpen.value = false
  clearRoute()
  selectedItemId.value = ""

  let selectedPlaceItem: NearbySearchItem | null = null

  try {
    const ready = await ensureGooglePlacesServices()
    if (ready && placesService.value) {
      const place = await getGooglePlaceDetails(placeId)
      if (place) {
        selectedPlaceItem = googlePlaceToNearbyItem(place, 0, false)
      }
    }
  }
  catch {
    selectedPlaceItem = null
  }
  finally {
    if (requestId === googleNearbyRequestId.value) {
      googleNearbyLoading.value = false
    }
  }

  if (requestId !== googleNearbyRequestId.value) {
    return
  }

  if (!selectedPlaceItem) {
    await searchGoogleNearbyPlaces(selectedLabel)
    const fallbackItem = googleNearbyResults.value[0]
    if (fallbackItem) {
      selectSuggestion(fallbackItem)
    }
    return
  }

  googleNearbyQuery.value = selectedLabel
  googleNearbyResults.value = [selectedPlaceItem]
  selectSuggestion(selectedPlaceItem)
}

watch(
  [
    selectedItemId,
    () => displayCardItems.value.map(item => item.id).join("|"),
  ],
  () => {
    void nextTick(scrollSelectedResultCardIntoView)
  },
  { flush: "post" },
)

watch(
  () => searchText.value.trim(),
  (query) => {
    if (googleNearbyQuery.value && query !== googleNearbyQuery.value) {
      clearGoogleNearbyResults()
    }

    if (isSuggestionPanelOpen.value && googlePlacesEnabled.value) {
      void refreshGooglePlaceSuggestions()
    }
  },
)

watch(googlePlacesEnabled, (enabled) => {
  if (enabled) {
    return
  }

  googlePlaceSuggestions.value = []
  googlePlacesLoading.value = false
  googleNearbyLoading.value = false
  clearGoogleNearbyResults()
})

onMounted(() => {
  void loadSearchNearbyConfig()
  if (!hasSharedOrigin.value) {
    void startDeviceOrientationTracking()
    void requestLocationPermission()
  }
})

onBeforeUnmount(() => {
  if (searchBlurTimer) {
    clearTimeout(searchBlurTimer)
  }
  if (locationWatchId !== null && import.meta.client && navigator.geolocation) {
    navigator.geolocation.clearWatch(locationWatchId)
    locationWatchId = null
  }
  stopLocationPolling()
  stopDeviceOrientationTracking()
})
</script>

<style scoped>
.nearby-map-page {
  position: relative;
  min-height: calc(100dvh - 64px);
  overflow: hidden;
  background: var(--color-secondary-200);
}

.nearby-map-page:fullscreen {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  background: var(--color-secondary-200);
}

.nearby-map-page__map,
.nearby-map-page__fallback {
  position: absolute;
  inset: 0;
}

.nearby-map-page__permission {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background:
    linear-gradient(color-mix(in srgb, var(--color-secondary-400) 16%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-secondary-400) 16%, transparent) 1px, transparent 1px),
    var(--bg-base);
  background-size: 44px 44px;
  padding: 40px 20px;
}

.nearby-map-page__permission-card {
  display: grid;
  width: min(100%, 520px);
  justify-items: center;
  gap: 14px;
  border: 1px solid var(--border-default);
  border-radius: 28px;
  background: #fff;
  box-shadow: var(--shadow-xl);
  padding: 34px 28px;
  text-align: center;
}

.nearby-map-page__permission-icon {
  display: inline-flex;
  width: 62px;
  height: 62px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-map-page__permission-icon svg {
  width: 30px;
  height: 30px;
}

.nearby-map-page__permission-card h1 {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: var(--weight-extrabold);
  line-height: 1.2;
}

.nearby-map-page__permission-card p {
  max-width: 430px;
  color: var(--text-secondary);
  font-size: var(--text-body);
  font-weight: var(--weight-semibold);
  line-height: 1.55;
}

.nearby-map-page__permission-note {
  margin-top: 4px;
  border-radius: 16px;
  background: var(--bg-surface-active);
  padding: 10px 12px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--weight-semibold);
  line-height: 1.45;
}

.nearby-map-page__permission-action {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 999px;
  background: var(--bg-brand);
  color: var(--text-inverse);
  cursor: pointer;
  font-size: var(--text-body);
  font-weight: var(--weight-extrabold);
  padding: 0 20px;
}

.nearby-map-page__permission-action:disabled {
  cursor: wait;
  opacity: 0.7;
}

.nearby-map-page__permission-action svg {
  width: 19px;
  height: 19px;
}

.nearby-map-page__fallback {
  background:
    linear-gradient(color-mix(in srgb, var(--color-secondary-400) 18%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-secondary-400) 18%, transparent) 1px, transparent 1px),
    var(--bg-base);
  background-size: 44px 44px;
}

.nearby-map-page__topbar {
  position: absolute;
  left: 50%;
  top: 18px;
  z-index: 30;
  display: flex;
  width: min(100% - 32px, 720px);
  transform: translateX(-50%);
  gap: 12px;
}

.nearby-map-page__search {
  position: relative;
  z-index: 31;
  min-width: 0;
  flex: 1;
}

.nearby-map-page__search-field {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 58px;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: #fff;
  box-shadow: var(--shadow-lg);
  padding: 0 18px;
}

.nearby-map-page__search-input {
  -webkit-appearance: none;
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: var(--weight-extrabold);
  line-height: 1.2;
}

.nearby-map-page__search-input::placeholder {
  color: var(--text-secondary);
}

.nearby-map-page__search-input::-webkit-search-cancel-button {
  display: none;
}

.nearby-map-page__search-icon,
.nearby-map-page__search-loading {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.nearby-map-page__suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 40;
  display: grid;
  max-height: min(360px, calc(100dvh - 116px));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--border-default);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--shadow-xl);
  padding: 8px;
}

.nearby-map-page__suggestion {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  border: 0;
  border-radius: 16px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  padding: 8px;
  text-align: left;
  touch-action: manipulation;
}

.nearby-map-page__suggestion:hover {
  background: var(--bg-surface-active);
}

.nearby-map-page__suggestion-avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-map-page__suggestion-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nearby-map-page__suggestion-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.nearby-map-page__suggestion-title,
.nearby-map-page__suggestion-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-map-page__suggestion-title {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__suggestion-meta {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--weight-semibold);
}

.nearby-map-page__suggestion-empty {
  display: inline-flex;
  padding: 8px 10px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--weight-semibold);
}

.nearby-map-page__suggestion-empty-wrap {
  display: flex;
}

.nearby-map-page__location-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-surface) 94%, transparent);
  box-shadow: var(--shadow-lg);
  color: var(--text-link);
  cursor: pointer;
  font-size: var(--text-body);
  font-weight: var(--weight-extrabold);
  padding: 0 20px;
}

.nearby-map-page__location-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.nearby-map-page__map-controls {
  position: absolute;
  top: 50%;
  right: 18px;
  z-index: 20;
  display: grid;
  gap: 10px;
  transform: translateY(-50%);
}

.nearby-map-page__map-control {
  display: inline-flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: #fff;
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  cursor: pointer;
}

.nearby-map-page__map-control:hover {
  color: var(--text-link);
}

.nearby-map-page__map-control svg {
  width: 20px;
  height: 20px;
}

.nearby-map-page__map-control--primary {
  background: var(--bg-brand);
  color: var(--text-inverse);
}

.nearby-map-page__map-control--primary:hover {
  color: var(--text-inverse);
}

.nearby-map-page__map-control--active {
  border-color: var(--border-strong);
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-map-page__map-guide {
  position: absolute;
  top: 50%;
  right: 76px;
  z-index: 21;
  width: min(360px, calc(100% - 104px));
  max-height: min(70dvh, 520px);
  overflow-y: auto;
  border: 1px solid var(--border-default);
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--shadow-xl);
  color: var(--text-primary);
  padding: 16px;
  transform: translateY(-50%);
}

.nearby-map-page__map-guide-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__map-guide-title svg {
  width: 18px;
  height: 18px;
  color: var(--text-link);
}

.nearby-map-page__map-guide ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
}

.nearby-map-page__map-guide li {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--weight-semibold);
  line-height: 1.45;
}

.nearby-map-page__bottom {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 8;
  width: 100%;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.nearby-map-page__panel {
  overflow: hidden;
  padding: 0;
}

.nearby-map-page__filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 260px) auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.nearby-map-page__tabs {
  display: flex;
  min-width: 0;
  gap: 8px;
  overflow-x: auto;
}

.nearby-map-page__tab,
.nearby-map-page__count,
.nearby-map-page__distance {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bg-surface) 90%, transparent);
  color: var(--color-secondary-600);
  font-size: var(--text-caption);
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  padding: 9px 12px;
  white-space: nowrap;
}

.nearby-map-page__tab--active {
  border-color: var(--border-strong);
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-map-page__distance {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.nearby-map-page__distance input {
  min-width: 0;
  accent-color: var(--bg-brand);
}

.nearby-map-page__count {
  padding: 10px 14px;
  white-space: nowrap;
}

.nearby-map-page__cards {
  display: grid;
  max-height: min(31dvh, 270px);
  gap: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-snap-type: y mandatory;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--text-secondary) 32%, transparent) transparent;
  -webkit-overflow-scrolling: touch;
}

.nearby-map-page__card {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.nearby-map-page__cards::-webkit-scrollbar {
  width: 6px;
}

.nearby-map-page__cards::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-secondary) 32%, transparent);
}

.nearby-map-page__state,
.nearby-map-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 130px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--bg-surface) 86%, transparent);
  color: var(--color-secondary-600);
  font-size: var(--text-body);
  font-weight: var(--weight-extrabold);
  text-align: center;
}

.nearby-map-page__skeleton {
  display: grid;
  gap: 10px;
  min-height: 130px;
  border: 1px solid color-mix(in srgb, var(--border-default) 74%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--bg-surface) 88%, transparent);
  padding: 12px;
}

.nearby-map-page__skeleton-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 10px 12px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
  padding: 12px;
}

.nearby-map-page__skeleton-avatar,
.nearby-map-page__skeleton-line {
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-secondary-200) 52%, var(--bg-surface));
}

.nearby-map-page__skeleton-avatar::after,
.nearby-map-page__skeleton-line::after {
  position: absolute;
  inset: 0;
  animation: nearby-skeleton-shimmer 1.25s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--bg-surface) 72%, transparent),
    transparent
  );
  content: "";
  transform: translateX(-100%);
}

.nearby-map-page__skeleton-avatar {
  grid-row: span 2;
  width: 48px;
  height: 48px;
  border-radius: 999px;
}

.nearby-map-page__skeleton-line {
  height: 12px;
  border-radius: 999px;
}

.nearby-map-page__skeleton-line--wide {
  width: min(100%, 280px);
}

.nearby-map-page__skeleton-line--medium {
  width: min(76%, 220px);
}

.nearby-map-page__skeleton-line--short {
  width: min(48%, 150px);
}

.nearby-map-page__route-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  border: 1px solid color-mix(in srgb, var(--text-danger) 22%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
  color: var(--text-danger);
  font-size: 13px;
  font-weight: var(--weight-bold);
  padding: 10px 12px;
}

.nearby-map-page__route-error button {
  margin-left: auto;
  border: 0;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--text-danger) 8%, transparent);
  color: var(--text-danger);
  cursor: pointer;
  font-size: 12px;
  font-weight: var(--weight-extrabold);
  padding: 6px 10px;
}

.nearby-map-page__state--error {
  color: var(--text-danger);
}

.nearby-map-page__state button,

.nearby-map-page__state,
.nearby-map-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 130px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--bg-surface) 86%, transparent);
  color: var(--color-secondary-600);
  font-size: var(--text-body);
  font-weight: var(--weight-extrabold);
  padding: 18px;
  text-align: center;
}

.nearby-map-page__route-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  border: 1px solid color-mix(in srgb, var(--text-danger) 22%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
  color: var(--text-danger);
  font-size: 13px;
  font-weight: var(--weight-bold);
  padding: 10px 12px;
}

.nearby-map-page__route-error button {
  margin-left: auto;
  border: 0;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--text-danger) 8%, transparent);
  color: var(--text-danger);
  cursor: pointer;
  font-size: 12px;
  font-weight: var(--weight-extrabold);
  padding: 6px 10px;
}

.nearby-map-page__state--error {
  color: var(--text-danger);
}

.nearby-map-page__state button,
.nearby-map-page__empty-action {
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  color: var(--text-inverse);
  cursor: pointer;
  font-size: 13px;
  font-weight: var(--weight-extrabold);
  padding: 10px 14px;
  text-decoration: none;
}

.nearby-map-page__empty h2 {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__empty p {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: var(--weight-semibold);
}

.nearby-map-page__spin {
  animation: nearby-spin 1s linear infinite;
}

@keyframes nearby-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes nearby-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (max-width: 760px) {
  .nearby-map-page {
    min-height: calc(100dvh - 58px);
  }

  .nearby-map-page__topbar {
    top: max(10px, env(safe-area-inset-top, 0px));
    flex-direction: row;
    align-items: stretch;
    width: calc(100% - 16px);
    gap: 8px;
  }

  .nearby-map-page__permission {
    padding: 24px 14px;
  }

  .nearby-map-page__permission-card {
    border-radius: 24px;
    padding: 28px 18px;
  }

  .nearby-map-page__search {
    flex: 1 1 auto;
  }

  .nearby-map-page__search-field {
    height: 50px;
    border-radius: 18px;
    padding: 0 13px;
  }

  .nearby-map-page__search-input {
    font-size: 16px;
    font-weight: var(--weight-bold);
  }

  .nearby-map-page__search-icon,
  .nearby-map-page__search-loading {
    width: 18px;
    height: 18px;
  }

  .nearby-map-page__suggestions {
    top: calc(100% + 6px);
    max-height: min(44dvh, 340px);
    border-radius: 18px;
    padding: 6px;
  }

  .nearby-map-page__suggestion {
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 9px;
    min-height: 54px;
    border-radius: 14px;
    padding: 8px;
  }

  .nearby-map-page__suggestion-avatar {
    width: 34px;
    height: 34px;
  }

  .nearby-map-page__suggestion-title {
    font-size: 14px;
  }

  .nearby-map-page__suggestion-meta {
    font-size: 12px;
  }

  .nearby-map-page__location-button {
    width: 48px;
    min-height: 48px;
    padding: 0;
    border-radius: 999px;
    background: #fff;
  }

  .nearby-map-page__location-button span {
    display: none;
  }

  .nearby-map-page__map-controls {
    right: 10px;
    gap: 8px;
    transform: translateY(-42%);
  }

  .nearby-map-page__map-control {
    width: 42px;
    height: 42px;
  }

  .nearby-map-page__map-guide {
    top: auto;
    right: 58px;
    bottom: calc(min(34dvh, 300px) + 14px + env(safe-area-inset-bottom, 0px));
    width: calc(100% - 74px);
    max-height: min(34dvh, 300px);
    border-radius: 18px;
    padding: 14px;
    transform: none;
  }

  .nearby-map-page__bottom {
    bottom: 0;
    width: 100%;
  }

  .nearby-map-page__panel {
    padding: 0;
  }

  .nearby-map-page__filters {
    grid-template-columns: 1fr;
  }

  .nearby-map-page__distance {
    grid-template-columns: 54px minmax(0, 1fr);
  }

  .nearby-map-page__count {
    justify-self: start;
  }

  .nearby-map-page__cards {
    max-height: min(34dvh, 300px);
    gap: 8px;
    padding: 1px 2px;
  }

  .nearby-map-page__state,
  .nearby-map-page__empty,
  .nearby-map-page__skeleton {
    min-height: 96px;
    border-radius: 18px;
    padding: 14px;
    font-size: 13px;
  }

  .nearby-map-page__skeleton-card {
    grid-template-columns: 42px minmax(0, 1fr);
    padding: 10px;
  }

  .nearby-map-page__skeleton-avatar {
    width: 42px;
    height: 42px;
  }
}

@media (max-width: 420px) {
  .nearby-map-page__topbar {
    width: calc(100% - 12px);
  }

  .nearby-map-page__map-controls {
    right: 8px;
  }

  .nearby-map-page__map-control {
    width: 38px;
    height: 38px;
  }

  .nearby-map-page__map-guide {
    right: 52px;
    width: calc(100% - 64px);
  }

  .nearby-map-page__cards {
    max-height: min(33dvh, 280px);
  }

}

/* Premium Location Guide Styles */
.nearby-map-page__permission-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  margin-top: 10px;
}

.nearby-map-page__permission-buttons .nearby-map-page__permission-action {
  width: 100%;
}

.nearby-map-page__guide-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-surface) 60%, transparent);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: var(--weight-bold);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nearby-map-page__guide-toggle:hover {
  background: var(--bg-surface-active);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.nearby-map-page__guide-toggle--active {
  border-color: var(--border-strong);
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-map-page__guide-card {
  width: 100%;
  max-width: 460px;
  margin-top: 20px;
  border: 1px solid var(--border-default);
  border-radius: 20px;
  background: color-mix(in srgb, var(--bg-muted) 40%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), var(--shadow-md);
  padding: 16px;
  overflow: hidden;
  text-align: left;
}

.nearby-map-page__guide-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-surface-active) 80%, transparent);
  padding: 4px;
  margin-bottom: 16px;
}

.nearby-map-page__guide-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 52px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 11px;
  font-weight: var(--weight-extrabold);
  transition: all 0.2s ease;
}

.nearby-map-page__guide-tab svg {
  width: 18px;
  height: 18px;
}

.nearby-map-page__guide-tab:hover {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--bg-surface) 40%, transparent);
}

.nearby-map-page__guide-tab--active {
  background: #fff;
  box-shadow: var(--shadow-sm);
  color: var(--text-link);
}

/* iOS active style override */
.nearby-map-page__guide-tab--active:has(.i-ph-apple-logo-fill) {
  color: #0f172a;
}

/* Android active style override */
.nearby-map-page__guide-tab--active:has(.i-ph-android-logo-fill) {
  color: #16a34a;
}

.nearby-map-page__guide-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.nearby-map-page__step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.nearby-map-page__step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  font-weight: var(--weight-extrabold);
}

.nearby-map-page__step-badge--ios {
  background: linear-gradient(135deg, #94a3b8, #475569);
  box-shadow: 0 2px 6px rgba(71, 85, 105, 0.25);
}

.nearby-map-page__step-badge--android {
  background: linear-gradient(135deg, #4ade80, #16a34a);
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.25);
}

.nearby-map-page__step-badge--desktop {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.nearby-map-page__step-text {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: var(--weight-medium);
  line-height: 1.5;
}

.nearby-map-page__step-text strong {
  font-weight: var(--weight-extrabold);
  color: var(--text-link);
}

@media (max-width: 480px) {
  .nearby-map-page__guide-tabs {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .nearby-map-page__guide-tab {
    flex-direction: row;
    height: 38px;
    gap: 8px;
    font-size: 12px;
  }
}
</style>
