<!-- English description: Lets users refine an address by choosing an exact draggable point on the shared Google map. -->

<template>
  <div class="precise-location-picker">
    <UButton
      type="button"
      icon="i-ph-map-trifold-duotone"
      color="neutral"
      variant="outline"
      size="md"
      :disabled="disabled"
      class="precise-location-picker__trigger"
      @click="openPicker"
    >
      {{ t("pages.locationMapPicker.open") }}
    </UButton>

    <p class="precise-location-picker__hint">
      {{ hasAddress
        ? t("pages.locationMapPicker.hint")
        : t("pages.locationMapPicker.emptyAddressHint") }}
    </p>

    <UModal
      v-model:open="isOpen"
      :title="t('pages.locationMapPicker.title')"
      :description="t('pages.locationMapPicker.description')"
      :dismissible="!isResolvingAddress"
      :ui="modalUi"
    >
      <template #body>
        <div class="precise-location-picker__body">
          <div class="precise-location-picker__map-shell">
            <div ref="mapElement" class="precise-location-picker__map" />

            <div v-if="isMapLoading" class="precise-location-picker__map-state">
              <UIcon name="i-ph-circle-notch-bold" class="precise-location-picker__spinner" />
              <span>{{ t("pages.locationMapPicker.loading") }}</span>
            </div>

            <div v-else-if="mapError" class="precise-location-picker__map-state precise-location-picker__map-state--error">
              <UIcon name="i-ph-warning-circle-duotone" class="h-5 w-5" />
              <span>{{ mapError }}</span>
            </div>
          </div>

          <div class="precise-location-picker__selection">
            <span class="precise-location-picker__selection-icon">
              <UIcon name="i-ph-map-pin-area-duotone" class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="precise-location-picker__selection-label">
                {{ t("pages.locationMapPicker.selectedAddress") }}
              </p>
              <p class="precise-location-picker__selection-address">
                {{ draftLocation.address || t("pages.locationMapPicker.noAddress") }}
              </p>
              <p v-if="hasDraftCoordinates" class="precise-location-picker__coordinates">
                {{ formatCoordinate(draftLocation.lat) }}, {{ formatCoordinate(draftLocation.lng) }}
              </p>
            </div>
            <UIcon
              v-if="isResolvingAddress"
              name="i-ph-circle-notch-bold"
              class="precise-location-picker__spinner precise-location-picker__selection-spinner"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="precise-location-picker__actions">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            :disabled="isResolvingAddress"
            @click="isOpen = false"
          >
            {{ t("pages.locationMapPicker.cancel") }}
          </UButton>
          <UButton
            type="button"
            icon="i-ph-check-bold"
            color="primary"
            :loading="isResolvingAddress"
            :disabled="!hasDraftCoordinates || Boolean(mapError)"
            @click="applySelection"
          >
            {{ t("pages.locationMapPicker.apply") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  emptyLocationSelection,
  hasLocationCoordinates,
  normalizeLocationSelection,
  type LocationSelection,
} from "../../domain/types/location.types"

type GoogleMapsRuntime = typeof google.maps & {
  importLibrary?: (libraryName: string) => Promise<unknown>
}

const props = withDefaults(defineProps<{
  modelValue?: LocationSelection | null
  disabled?: boolean
}>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: LocationSelection]
}>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const mapElement = ref<HTMLDivElement | null>(null)
const isOpen = ref(false)
const isMapLoading = ref(false)
const isResolvingAddress = ref(false)
const mapError = ref("")
const draftLocation = ref<LocationSelection>(emptyLocationSelection())
const mapInstance = shallowRef<google.maps.Map | null>(null)
const markerInstance = shallowRef<google.maps.Marker | null>(null)
const currentUserMarkerInstance = shallowRef<google.maps.Marker | null>(null)
const currentUserRadiusCircle = shallowRef<google.maps.Circle | null>(null)
const markerConstructor = shallowRef<typeof google.maps.Marker | null>(null)
const geocoderInstance = shallowRef<google.maps.Geocoder | null>(null)
let geocodeSequence = 0
let geolocationWatchId: number | null = null
let lastFittedUserPosition: google.maps.LatLngLiteral | null = null
let shouldUseRealtimeAsInitialSelection = false

const { load } = useScriptGoogleMaps({
  libraries: ["places"],
  trigger: "manual",
})

const modalUi = {
  content: "max-w-4xl",
  body: "p-0 sm:p-0",
  footer: "p-4 sm:px-6",
}

const defaultCenter = {
  lat: 21.0278,
  lng: 105.8342,
}

const realtimeViewportRadiusMeters = 50
const realtimeViewportRefitDistanceMeters = 250

const googleMapsMapId = computed(() =>
  String(runtimeConfig.public.googleMaps?.mapId || "").trim(),
)

const normalizedValue = computed(() =>
  normalizeLocationSelection(props.modelValue),
)

const hasAddress = computed(() =>
  Boolean(normalizedValue.value.address.trim()),
)

const hasDraftCoordinates = computed(() =>
  hasLocationCoordinates(draftLocation.value),
)

watch(isOpen, (open) => {
  if (!open) {
    teardownMap()
    return
  }

  draftLocation.value = normalizeLocationSelection(normalizedValue.value)
  mapError.value = ""
  void initializeMap()
})

onBeforeUnmount(() => {
  teardownMap()
})

function openPicker() {
  if (props.disabled) {
    return
  }

  isOpen.value = true
}

async function initializeMap() {
  if (!import.meta.client) {
    return
  }

  isMapLoading.value = true
  mapError.value = ""

  try {
    await load()
    await nextTick()
    await waitForMapElement()

    const mapsRuntime = window.google?.maps as GoogleMapsRuntime | undefined

    if (!mapsRuntime || !mapElement.value) {
      throw new Error(t("pages.locationMapPicker.unavailable"))
    }

    const mapsLibrary = typeof mapsRuntime.importLibrary === "function"
      ? await mapsRuntime.importLibrary("maps") as google.maps.MapsLibrary
      : null
    const markerLibrary = typeof mapsRuntime.importLibrary === "function"
      ? await mapsRuntime.importLibrary("marker") as google.maps.MarkerLibrary & {
          Marker?: typeof google.maps.Marker
        }
      : null
    const MapConstructor = mapsLibrary?.Map ?? mapsRuntime.Map
    const MarkerConstructor = markerLibrary?.Marker ?? mapsRuntime.Marker

    if (typeof MapConstructor !== "function" || typeof MarkerConstructor !== "function") {
      throw new Error(t("pages.locationMapPicker.unavailable"))
    }

    markerConstructor.value = MarkerConstructor
    geocoderInstance.value = new mapsRuntime.Geocoder()
    shouldUseRealtimeAsInitialSelection = !hasAddress.value
      && !hasLocationCoordinates(draftLocation.value)
    const selectionCenter = await resolveSelectionCenter() ?? defaultCenter

    mapInstance.value = new MapConstructor(mapElement.value, {
      center: selectionCenter,
      zoom: 16,
      clickableIcons: false,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: "greedy",
      ...(googleMapsMapId.value ? { mapId: googleMapsMapId.value } : {}),
    })

    markerInstance.value = new MarkerConstructor({
      map: mapInstance.value,
      position: selectionCenter,
      draggable: true,
      zIndex: 30,
      title: t("pages.locationMapPicker.markerTitle"),
    })

    markerInstance.value.addListener("dragend", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        shouldUseRealtimeAsInitialSelection = false
        void selectPosition(event.latLng)
      }
    })

    mapInstance.value.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        shouldUseRealtimeAsInitialSelection = false
        void selectPosition(event.latLng)
      }
    })

    if (
      !hasLocationCoordinates(draftLocation.value)
      && !shouldUseRealtimeAsInitialSelection
    ) {
      await selectPosition(selectionCenter)
    }

    fitViewportAround(selectionCenter)
    startRealtimePositionTracking()
  }
  catch (error) {
    mapError.value = error instanceof Error
      ? error.message
      : t("pages.locationMapPicker.loadError")
  }
  finally {
    isMapLoading.value = false
  }
}

async function waitForMapElement() {
  for (let attempt = 0; attempt < 8 && !mapElement.value; attempt += 1) {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function resolveSelectionCenter(): Promise<google.maps.LatLngLiteral | null> {
  if (hasLocationCoordinates(draftLocation.value)) {
    return {
      lat: draftLocation.value.lat as number,
      lng: draftLocation.value.lng as number,
    }
  }

  const geocodedAddress = await geocodeAddress(draftLocation.value.address)

  if (geocodedAddress) {
    draftLocation.value = {
      address: geocodedAddress.formattedAddress || draftLocation.value.address,
      lat: geocodedAddress.position.lat,
      lng: geocodedAddress.position.lng,
      placeId: geocodedAddress.placeId,
    }
    return geocodedAddress.position
  }

  return null
}

function startRealtimePositionTracking() {
  if (!navigator.geolocation || geolocationWatchId !== null) {
    return
  }

  geolocationWatchId = navigator.geolocation.watchPosition(
    position => updateRealtimeUserPosition({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }),
    () => undefined,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  )
}

function updateRealtimeUserPosition(position: google.maps.LatLngLiteral) {
  const map = mapInstance.value
  const MarkerConstructor = markerConstructor.value
  const mapsRuntime = window.google?.maps

  if (!map || !MarkerConstructor || !mapsRuntime) {
    return
  }

  if (shouldUseRealtimeAsInitialSelection) {
    shouldUseRealtimeAsInitialSelection = false
    void selectPosition(position)
  }

  if (!currentUserMarkerInstance.value) {
    const rootStyles = getComputedStyle(document.documentElement)
    const markerColor = rootStyles.getPropertyValue("--bg-brand").trim()
      || rootStyles.getPropertyValue("--color-primary-500").trim()
    const markerStroke = rootStyles.getPropertyValue("--bg-surface").trim()

    currentUserMarkerInstance.value = new MarkerConstructor({
      map,
      position,
      clickable: false,
      zIndex: 20,
      title: t("pages.locationMapPicker.userLocationTitle"),
      icon: {
        path: mapsRuntime.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: markerStroke,
        strokeOpacity: 1,
        strokeWeight: 3,
      },
    })
  }
  else {
    currentUserMarkerInstance.value.setPosition(position)
  }

  if (!currentUserRadiusCircle.value) {
    const rootStyles = getComputedStyle(document.documentElement)
    const radiusColor = rootStyles.getPropertyValue("--bg-brand").trim()
      || rootStyles.getPropertyValue("--color-primary-500").trim()

    currentUserRadiusCircle.value = new mapsRuntime.Circle({
      map,
      center: position,
      radius: realtimeViewportRadiusMeters,
      clickable: false,
      fillColor: radiusColor,
      fillOpacity: 0.04,
      strokeColor: radiusColor,
      strokeOpacity: 0.28,
      strokeWeight: 1,
    })
  }
  else {
    currentUserRadiusCircle.value.setCenter(position)
  }

  if (
    !lastFittedUserPosition
    || distanceMeters(lastFittedUserPosition, position) >= realtimeViewportRefitDistanceMeters
  ) {
    fitViewportAround(position)
    lastFittedUserPosition = position
  }
}

function fitViewportAround(center: google.maps.LatLngLiteral) {
  const map = mapInstance.value
  const mapsRuntime = window.google?.maps

  if (!map || !mapsRuntime?.LatLngBounds) {
    return
  }

  const latitudeDelta = realtimeViewportRadiusMeters / 111320
  const longitudeScale = Math.max(
    Math.cos(center.lat * Math.PI / 180),
    0.2,
  )
  const longitudeDelta = realtimeViewportRadiusMeters / (111320 * longitudeScale)
  const bounds = new mapsRuntime.LatLngBounds(
    {
      lat: center.lat - latitudeDelta,
      lng: center.lng - longitudeDelta,
    },
    {
      lat: center.lat + latitudeDelta,
      lng: center.lng + longitudeDelta,
    },
  )

  map.fitBounds(bounds, {
    top: 28,
    right: 28,
    bottom: 28,
    left: 28,
  })
}

function distanceMeters(
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral,
) {
  const earthRadiusMeters = 6371000
  const latitudeDelta = (to.lat - from.lat) * Math.PI / 180
  const longitudeDelta = (to.lng - from.lng) * Math.PI / 180
  const fromLatitude = from.lat * Math.PI / 180
  const toLatitude = to.lat * Math.PI / 180
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude)
    * Math.cos(toLatitude)
    * Math.sin(longitudeDelta / 2) ** 2

  return earthRadiusMeters * 2 * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(1 - haversine),
  )
}

async function selectPosition(position: google.maps.LatLng | google.maps.LatLngLiteral) {
  const literal = "toJSON" in position
    ? position.toJSON()
    : position

  markerInstance.value?.setPosition(literal)
  mapInstance.value?.panTo(literal)

  draftLocation.value = {
    ...draftLocation.value,
    lat: literal.lat,
    lng: literal.lng,
    placeId: "",
  }

  const requestId = geocodeSequence + 1
  geocodeSequence = requestId
  isResolvingAddress.value = true

  try {
    const result = await geocodeLocation(literal)

    if (requestId !== geocodeSequence || !result) {
      return
    }

    draftLocation.value = {
      address: result.formatted_address || draftLocation.value.address,
      lat: literal.lat,
      lng: literal.lng,
      placeId: result.place_id || "",
    }
  }
  finally {
    if (requestId === geocodeSequence) {
      isResolvingAddress.value = false
    }
  }
}

async function geocodeAddress(address: string) {
  const query = address.trim()

  if (!query || !geocoderInstance.value) {
    return null
  }

  const result = await geocode({ address: query })

  if (!result?.geometry?.location) {
    return null
  }

  return {
    formattedAddress: result.formatted_address || query,
    position: result.geometry.location.toJSON(),
    placeId: result.place_id || "",
  }
}

async function geocodeLocation(position: google.maps.LatLngLiteral) {
  if (!geocoderInstance.value) {
    return null
  }

  return await geocode({ location: position })
}

function geocode(request: google.maps.GeocoderRequest) {
  return new Promise<google.maps.GeocoderResult | null>((resolve) => {
    geocoderInstance.value?.geocode(request, (results, status) => {
      const okStatus = window.google?.maps?.GeocoderStatus?.OK
      resolve(status === okStatus ? results?.[0] ?? null : null)
    })
  })
}

async function applySelection() {
  if (!hasDraftCoordinates.value) {
    return
  }

  const position = {
    lat: draftLocation.value.lat as number,
    lng: draftLocation.value.lng as number,
  }
  const requestId = geocodeSequence + 1
  geocodeSequence = requestId
  isResolvingAddress.value = true

  try {
    const result = await geocodeLocation(position)

    if (requestId !== geocodeSequence) {
      return
    }

    const selectedLocation = normalizeLocationSelection({
      ...draftLocation.value,
      address: result?.formatted_address || draftLocation.value.address,
      lat: position.lat,
      lng: position.lng,
      placeId: result?.place_id || draftLocation.value.placeId,
    })

    draftLocation.value = selectedLocation
    emit("update:modelValue", selectedLocation)
    isOpen.value = false
  }
  finally {
    if (requestId === geocodeSequence) {
      isResolvingAddress.value = false
    }
  }
}

function teardownMap() {
  geocodeSequence += 1
  isResolvingAddress.value = false
  lastFittedUserPosition = null
  shouldUseRealtimeAsInitialSelection = false

  if (import.meta.client && geolocationWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(geolocationWatchId)
    geolocationWatchId = null
  }

  if (import.meta.client && window.google?.maps?.event) {
    if (markerInstance.value) {
      window.google.maps.event.clearInstanceListeners(markerInstance.value)
    }
    if (currentUserMarkerInstance.value) {
      window.google.maps.event.clearInstanceListeners(currentUserMarkerInstance.value)
    }
    if (mapInstance.value) {
      window.google.maps.event.clearInstanceListeners(mapInstance.value)
    }
  }

  markerInstance.value?.setMap(null)
  currentUserMarkerInstance.value?.setMap(null)
  currentUserRadiusCircle.value?.setMap(null)
  markerInstance.value = null
  currentUserMarkerInstance.value = null
  currentUserRadiusCircle.value = null
  markerConstructor.value = null
  mapInstance.value = null
  geocoderInstance.value = null
}

function formatCoordinate(value: number | null) {
  return typeof value === "number" ? value.toFixed(6) : "-"
}
</script>

<style scoped>
.precise-location-picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-top: 10px;
}

.precise-location-picker__trigger {
  border-color: var(--border-light);
  color: var(--text-primary);
}

.precise-location-picker__hint {
  min-width: 0;
  flex: 1 1 260px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.precise-location-picker__body {
  background: var(--bg-surface);
}

.precise-location-picker__map-shell {
  position: relative;
  height: min(58vh, 520px);
  min-height: 340px;
  overflow: hidden;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-muted);
}

.precise-location-picker__map {
  height: 100%;
  width: 100%;
}

.precise-location-picker__map-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 700;
}

.precise-location-picker__map-state--error {
  color: var(--color-error-600);
}

.precise-location-picker__spinner {
  height: 20px;
  width: 20px;
  animation: precise-location-picker-spin 0.8s linear infinite;
}

.precise-location-picker__selection {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
}

.precise-location-picker__selection-icon {
  display: inline-flex;
  height: 40px;
  width: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  color: var(--bg-brand);
}

.precise-location-picker__selection-label {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.precise-location-picker__selection-address {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
}

.precise-location-picker__coordinates {
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 600;
}

.precise-location-picker__selection-spinner {
  flex: 0 0 auto;
  color: var(--bg-brand);
}

.precise-location-picker__actions {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

@keyframes precise-location-picker-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .precise-location-picker__map-shell {
    height: 54vh;
    min-height: 300px;
  }

  .precise-location-picker__selection {
    padding: 14px 16px;
  }
}
</style>
