<!-- English description: Google Maps canvas for nearby user and page search markers. -->

<template>
  <div class="nearby-map">
    <div ref="mapElement" class="nearby-map__canvas" />
    <div v-if="mapError" class="nearby-map__error">
      <Icon name="i-ph-warning-circle-duotone" class="nearby-map__error-icon" />
      <span>{{ mapError }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  NearbySearchItem,
  NearbySearchOrigin,
} from "../../domain/types/search-nearby.types"

const props = defineProps<{
  origin: NearbySearchOrigin
  items: NearbySearchItem[]
  selectedItemId: string
  originFocusKey: number
  routeTargetItem: NearbySearchItem | null
}>()

const emit = defineEmits<{
  select: [item: NearbySearchItem]
  routeError: [message: string]
}>()

const mapElement = ref<HTMLDivElement | null>(null)
const mapError = ref("")
const markerInstances = shallowRef<google.maps.Marker[]>([])
const mapInstance = shallowRef<google.maps.Map | null>(null)
const markerConstructor = shallowRef<typeof google.maps.Marker | null>(null)
const directionsServiceConstructor = shallowRef<typeof google.maps.DirectionsService | null>(null)
const directionsRendererConstructor = shallowRef<typeof google.maps.DirectionsRenderer | null>(null)
const directionsRenderer = shallowRef<google.maps.DirectionsRenderer | null>(null)
let routeRequestSequence = 0

const { load } = useScriptGoogleMaps({
  trigger: "manual",
})

const defaultCenter = {
  lat: 21.0278,
  lng: 105.8342,
}

type GoogleMapsRuntime = typeof google.maps & {
  importLibrary?: (libraryName: string) => Promise<unknown>
}

const currentCenter = computed(() => ({
  lat: props.origin.lat ?? defaultCenter.lat,
  lng: props.origin.lng ?? defaultCenter.lng,
}))

async function resolveMapConstructors() {
  const mapsRuntime = window.google?.maps as GoogleMapsRuntime | undefined

  if (!mapsRuntime) {
    return null
  }

  if (typeof mapsRuntime.importLibrary === "function") {
    const mapsLibrary = await mapsRuntime.importLibrary("maps") as google.maps.MapsLibrary
    const markerLibrary = await mapsRuntime.importLibrary("marker") as google.maps.MarkerLibrary & {
      Marker?: typeof google.maps.Marker
    }
    let routesLibrary: Partial<{
      DirectionsService: typeof google.maps.DirectionsService
      DirectionsRenderer: typeof google.maps.DirectionsRenderer
    }> = {}

    try {
      routesLibrary = await mapsRuntime.importLibrary("routes") as typeof routesLibrary
    }
    catch {
      routesLibrary = {}
    }
    const Marker = markerLibrary.Marker ?? mapsRuntime.Marker
    const DirectionsService = routesLibrary.DirectionsService ?? mapsRuntime.DirectionsService ?? null
    const DirectionsRenderer = routesLibrary.DirectionsRenderer ?? mapsRuntime.DirectionsRenderer ?? null

    if (typeof mapsLibrary.Map === "function" && typeof Marker === "function") {
      return { Map: mapsLibrary.Map, Marker, DirectionsService, DirectionsRenderer }
    }
  }

  if (typeof mapsRuntime.Map === "function" && typeof mapsRuntime.Marker === "function") {
    return {
      Map: mapsRuntime.Map,
      Marker: mapsRuntime.Marker,
      DirectionsService: mapsRuntime.DirectionsService ?? null,
      DirectionsRenderer: mapsRuntime.DirectionsRenderer ?? null,
    }
  }

  return null
}

function clearMarkers() {
  markerInstances.value.forEach(marker => marker.setMap(null))
  markerInstances.value = []
}

function clearRoute() {
  routeRequestSequence += 1

  if (directionsRenderer.value) {
    directionsRenderer.value.setMap(null)
    directionsRenderer.value = null
  }
}

function createMarkerIcon(color: string, selected = false): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    scale: selected ? 12 : 10,
    strokeColor: "#ffffff",
    strokeWeight: selected ? 4 : 3,
  }
}

function fitMarkers() {
  const map = mapInstance.value

  if (!map || !window.google?.maps) {
    return
  }

  const coordinates = [
    props.origin.lat !== null && props.origin.lng !== null
      ? { lat: props.origin.lat, lng: props.origin.lng }
      : null,
    ...props.items
      .filter(item => item.lat !== null && item.lng !== null)
      .map(item => ({ lat: item.lat as number, lng: item.lng as number })),
  ].filter((point): point is { lat: number; lng: number } => Boolean(point))

  if (coordinates.length <= 1) {
    map.setCenter(currentCenter.value)
    map.setZoom(13)
    return
  }

  const bounds = new window.google.maps.LatLngBounds()
  coordinates.forEach(point => bounds.extend(point))
  map.fitBounds(bounds, 80)
}

function focusSelectedItem() {
  const map = mapInstance.value
  const selected = props.items.find(item => item.id === props.selectedItemId)

  if (!map || !selected || selected.lat === null || selected.lng === null) {
    return
  }

  map.panTo({ lat: selected.lat, lng: selected.lng })
  map.setZoom(Math.max(map.getZoom() ?? 14, 15))
}

function focusOrigin() {
  const map = mapInstance.value

  if (!map || props.origin.lat === null || props.origin.lng === null) {
    return
  }

  map.panTo({ lat: props.origin.lat, lng: props.origin.lng })
  map.setZoom(Math.max(map.getZoom() ?? 14, 15))
}

function renderMarkers() {
  const map = mapInstance.value
  const Marker = markerConstructor.value

  if (!map || !Marker || !window.google?.maps) {
    return
  }

  clearMarkers()

  const markers: google.maps.Marker[] = []

  if (props.origin.lat !== null && props.origin.lng !== null) {
    markers.push(new Marker({
      map,
      position: { lat: props.origin.lat, lng: props.origin.lng },
      title: "Vị trí của tôi",
      icon: createMarkerIcon("#2563eb", !props.selectedItemId),
      zIndex: 20,
    }))
  }

  props.items.forEach((item) => {
    if (item.lat === null || item.lng === null) {
      return
    }

    const marker = new Marker({
      map,
      position: { lat: item.lat, lng: item.lng },
      title: item.title,
      icon: createMarkerIcon(item.type === "page" ? "#059669" : "#dc2626", item.id === props.selectedItemId),
      label: {
        text: item.type === "page" ? "P" : "U",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "800",
      },
      zIndex: item.id === props.selectedItemId ? 30 : 10,
    })

    marker.addListener("click", () => emit("select", item))
    markers.push(marker)
  })

  markerInstances.value = markers

  if (props.selectedItemId) {
    focusSelectedItem()
    return
  }

  fitMarkers()
}

function renderRoute() {
  const map = mapInstance.value
  const target = props.routeTargetItem
  const DirectionsService = directionsServiceConstructor.value
  const DirectionsRenderer = directionsRendererConstructor.value

  if (!target) {
    clearRoute()
    return
  }

  if (
    !map
    || !DirectionsService
    || !DirectionsRenderer
    || !window.google?.maps
    || props.origin.lat === null
    || props.origin.lng === null
    || target.lat === null
    || target.lng === null
  ) {
    clearRoute()
    emit("routeError", "Khong the ve chi duong cho ket qua nay.")
    return
  }

  const requestId = ++routeRequestSequence
  const service = new DirectionsService()
  const renderer = new DirectionsRenderer({
    map,
    suppressMarkers: true,
    preserveViewport: false,
    polylineOptions: {
      strokeColor: "#2563eb",
      strokeOpacity: 0.95,
      strokeWeight: 5,
    },
  })

  directionsRenderer.value?.setMap(null)
  directionsRenderer.value = renderer

  service.route(
    {
      origin: { lat: props.origin.lat, lng: props.origin.lng },
      destination: { lat: target.lat, lng: target.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (requestId !== routeRequestSequence || props.routeTargetItem?.id !== target.id) {
        renderer.setMap(null)
        return
      }

      if (status === window.google.maps.DirectionsStatus.OK && result) {
        renderer.setDirections(result)
        return
      }

      clearRoute()
      emit("routeError", `Google Directions returned ${status}.`)
    },
  )
}

async function initializeMap() {
  if (!import.meta.client || !mapElement.value) {
    return
  }

  try {
    await load()
  }
  catch {
    mapError.value = "Khong tai duoc Google Maps cho ten mien hien tai."
    return
  }

  if (!window.google?.maps) {
    mapError.value = "Google Maps chua san sang."
    return
  }

  let constructors: Awaited<ReturnType<typeof resolveMapConstructors>>

  try {
    constructors = await resolveMapConstructors()
  }
  catch {
    mapError.value = "Khong tai duoc Google Maps cho ten mien hien tai."
    return
  }

  if (!constructors) {
    mapError.value = "Google Maps chua san sang."
    return
  }

  markerConstructor.value = constructors.Marker
  directionsServiceConstructor.value = constructors.DirectionsService
  directionsRendererConstructor.value = constructors.DirectionsRenderer
  mapInstance.value = new constructors.Map(mapElement.value, {
    center: currentCenter.value,
    zoom: 13,
    clickableIcons: true,
    fullscreenControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
  })

  renderMarkers()
  renderRoute()
}

onMounted(() => {
  void initializeMap()
})

watch(
  () => [props.origin.lat, props.origin.lng, props.items, props.selectedItemId],
  () => renderMarkers(),
  { deep: true },
)

watch(
  () => props.originFocusKey,
  () => focusOrigin(),
)

watch(
  () => [
    props.routeTargetItem?.id,
    props.routeTargetItem?.lat,
    props.routeTargetItem?.lng,
    props.origin.lat,
    props.origin.lng,
  ],
  () => renderRoute(),
)

onBeforeUnmount(() => {
  clearMarkers()
  clearRoute()
})
</script>

<style scoped>
.nearby-map,
.nearby-map__canvas {
  position: absolute;
  inset: 0;
  min-height: 100%;
}

.nearby-map__canvas {
  background: var(--color-secondary-200);
}

.nearby-map__error {
  position: absolute;
  left: 50%;
  top: 96px;
  display: inline-flex;
  max-width: calc(100% - 32px);
  transform: translateX(-50%);
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bg-surface) 96%, transparent);
  box-shadow: var(--shadow-lg);
  color: var(--text-danger);
  font-size: 13px;
  font-weight: var(--weight-bold);
  padding: 10px 14px;
  z-index: 4;
}

.nearby-map__error-icon {
  height: 18px;
  width: 18px;
}
</style>
