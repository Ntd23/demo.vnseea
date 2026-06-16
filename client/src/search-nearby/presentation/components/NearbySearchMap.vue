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
  originUpdateKey: number
  routeOriginUpdateKey: number
  routeFitKey: number
  routeTargetItem: NearbySearchItem | null
  routeNavigationActive: boolean
  originHeading?: number | null
  searchRadiusKm?: number
  zoomInKey?: number
  zoomOutKey?: number
}>()

const emit = defineEmits<{
  select: [item: NearbySearchItem]
  directions: [item: NearbySearchItem]
  routeError: [message: string]
}>()

const runtimeConfig = useRuntimeConfig()
const googleMapsMapId = computed(() => String(runtimeConfig.public.scripts?.googleMaps?.mapId || "").trim())
const mapElement = ref<HTMLDivElement | null>(null)
const mapError = ref("")
const markerInstances = shallowRef<google.maps.Marker[]>([])
const originMarker = shallowRef<google.maps.Marker | null>(null)
const originRadiusCircle = shallowRef<google.maps.Circle | null>(null)
const mapInstance = shallowRef<google.maps.Map | null>(null)
const markerConstructor = shallowRef<typeof google.maps.Marker | null>(null)
const directionsServiceConstructor = shallowRef<typeof google.maps.DirectionsService | null>(null)
const directionsRendererConstructor = shallowRef<typeof google.maps.DirectionsRenderer | null>(null)
const directionsRenderer = shallowRef<google.maps.DirectionsRenderer | null>(null)
const placesService = shallowRef<google.maps.places.PlacesService | null>(null)
let routeRequestSequence = 0
let lastMarkersViewportKey = ""
let lastRenderedRouteTargetId = ""
let lastRouteFitKey = -1
let lastOriginRadiusCenter: { lat: number, lng: number } | null = null
let lastOriginRadiusMeters = 0
let lastMobileRouteHeading: number | null = null
let lastMobileRouteCameraCenter: { lat: number, lng: number } | null = null
let lastMobileRouteCameraAt = 0
let lastMobileRoutePath: { lat: number, lng: number }[] = []
let displayedOriginPosition: { lat: number, lng: number } | null = null
let displayedOriginHeading: number | null = null
let originMarkerAnimationFrame = 0
let mobileRouteCameraAnimationFrame = 0
let displayedMobileCameraCenter: { lat: number, lng: number } | null = null
let displayedMobileCameraHeading: number | null = null

const originRadiusMinMoveMeters = 25
const mobileRouteFollowTilt = 75
const mobileRouteFollowZoom = 19
const mobileRouteHeadingLookAheadMeters = 110
const mobileRouteSnapMaxDistanceMeters = 45
const mobileRouteCameraMinIntervalMs = 450
const mobileRouteCameraMinMoveMeters = 2.5
const mobileRouteHeadingMinDelta = 3
const mobileRouteHeadingMaxStep = 18
const originMarkerAnimationMs = 520
const mobileRouteCameraAnimationMs = 560

const { load } = useScriptGoogleMaps({
  libraries: ["places", "routes"],
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

function createMarkersViewportKey() {
  const originStatus = props.origin.lat === null || props.origin.lng === null
    ? "no-origin"
    : "has-origin"
  const itemsKey = props.items
    .map(item => `${item.id}:${item.lat ?? "x"}:${item.lng ?? "x"}:${item.pinned ? 1 : 0}`)
    .join(",")

  return [
    originStatus,
    props.selectedItemId,
    props.searchRadiusKm ?? "",
    itemsKey,
  ].join("|")
}

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

function clearOriginMarker() {
  if (originMarkerAnimationFrame) {
    cancelAnimationFrame(originMarkerAnimationFrame)
    originMarkerAnimationFrame = 0
  }
  originMarker.value?.setMap(null)
  originMarker.value = null
  displayedOriginPosition = null
  displayedOriginHeading = null
}

function clearOriginRadiusCircle() {
  originRadiusCircle.value?.setMap(null)
  originRadiusCircle.value = null
}

function clearRoute() {
  routeRequestSequence += 1
  lastRenderedRouteTargetId = ""
  lastRouteFitKey = -1
  lastMobileRouteHeading = null
  lastMobileRouteCameraCenter = null
  lastMobileRouteCameraAt = 0
  lastMobileRoutePath = []
  displayedMobileCameraCenter = null
  displayedMobileCameraHeading = null
  if (mobileRouteCameraAnimationFrame) {
    cancelAnimationFrame(mobileRouteCameraAnimationFrame)
    mobileRouteCameraAnimationFrame = 0
  }
  resetMobileRouteCamera()

  if (directionsRenderer.value) {
    directionsRenderer.value.setMap(null)
    directionsRenderer.value = null
  }
}

function createPinIcon(color: string, selected = false): google.maps.Icon {
  const width = selected ? 42 : 38
  const height = selected ? 54 : 48
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 38 48">
      <path d="M19 46S3 28.5 3 17.5C3 8.4 10.2 1 19 1s16 7.4 16 16.5C35 28.5 19 46 19 46Z" fill="${color}" stroke="#fff" stroke-width="3"/>
      <circle cx="19" cy="17" r="8" fill="#fff"/>
    </svg>
  `.trim()

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(width, height),
    anchor: new window.google.maps.Point(width / 2, height),
    labelOrigin: new window.google.maps.Point(width + 34, 17),
  }
}

function createOriginIcon(selected = false, heading: number | null = null): google.maps.Symbol {
  return {
    path: "M 0 -18 L 11 15 L 0 9 L -11 15 Z",
    anchor: new window.google.maps.Point(0, 0),
    fillColor: "#2563eb",
    fillOpacity: 1,
    rotation: heading ?? 0,
    scale: selected ? 1.16 : 1,
    strokeColor: "#ffffff",
    strokeOpacity: 1,
    strokeWeight: selected ? 3.2 : 2.8,
  }
}

function isMobileViewport() {
  return import.meta.client && window.matchMedia("(max-width: 760px)").matches
}

function calculateDistanceMeters(lat: number, lng: number) {
  if (props.origin.lat === null || props.origin.lng === null) {
    return null
  }

  const earthRadiusMeters = 6371000
  const toRad = (value: number) => value * Math.PI / 180
  const latFrom = toRad(props.origin.lat)
  const lngFrom = toRad(props.origin.lng)
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

function normalizeHeading(heading: number) {
  return (heading % 360 + 360) % 360
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

function calculateHeadingDelta(from: number, to: number) {
  const delta = Math.abs(normalizeHeading(to) - normalizeHeading(from)) % 360

  return Math.min(delta, 360 - delta)
}

function moveHeadingToward(from: number, to: number, maxStep: number) {
  const start = normalizeHeading(from)
  const end = normalizeHeading(to)
  const clockwiseDelta = (end - start + 360) % 360
  const signedDelta = clockwiseDelta > 180 ? clockwiseDelta - 360 : clockwiseDelta
  const clampedDelta = Math.max(-maxStep, Math.min(maxStep, signedDelta))

  return normalizeHeading(start + clampedDelta)
}

function interpolatePoint(
  from: { lat: number, lng: number },
  to: { lat: number, lng: number },
  ratio: number,
) {
  const clampedRatio = Math.max(0, Math.min(1, ratio))

  return {
    lat: from.lat + (to.lat - from.lat) * clampedRatio,
    lng: from.lng + (to.lng - from.lng) * clampedRatio,
  }
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3
}

function interpolateHeading(from: number, to: number, ratio: number) {
  const start = normalizeHeading(from)
  const end = normalizeHeading(to)
  const clockwiseDelta = (end - start + 360) % 360
  const signedDelta = clockwiseDelta > 180 ? clockwiseDelta - 360 : clockwiseDelta

  return normalizeHeading(start + signedDelta * Math.max(0, Math.min(1, ratio)))
}

function projectPointOnSegment(
  point: { lat: number, lng: number },
  from: { lat: number, lng: number },
  to: { lat: number, lng: number },
) {
  const latScale = 111320
  const lngScale = Math.max(1, Math.cos(point.lat * Math.PI / 180) * 111320)
  const ax = from.lng * lngScale
  const ay = from.lat * latScale
  const bx = to.lng * lngScale
  const by = to.lat * latScale
  const px = point.lng * lngScale
  const py = point.lat * latScale
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const ratio = lengthSquared <= 0
    ? 0
    : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))

  return interpolatePoint(from, to, ratio)
}

function findClosestRouteProjection(origin: { lat: number, lng: number }) {
  if (lastMobileRoutePath.length === 0) {
    return null
  }

  if (lastMobileRoutePath.length === 1) {
    const point = lastMobileRoutePath[0]

    return {
      point,
      index: 0,
      distanceMeters: calculatePointDistanceMeters(origin, point),
    }
  }

  let closest: { point: { lat: number, lng: number }, index: number, distanceMeters: number } | null = null

  for (let index = 0; index < lastMobileRoutePath.length - 1; index += 1) {
    const projectedPoint = projectPointOnSegment(origin, lastMobileRoutePath[index], lastMobileRoutePath[index + 1])
    const distanceMeters = calculatePointDistanceMeters(origin, projectedPoint)

    if (!closest || distanceMeters < closest.distanceMeters) {
      closest = {
        point: projectedPoint,
        index,
        distanceMeters,
      }
    }
  }

  return closest
}

function resolveDisplayOrigin(useRouteSnap = props.routeNavigationActive) {
  if (props.origin.lat === null || props.origin.lng === null) {
    return null
  }

  const rawOrigin = { lat: props.origin.lat, lng: props.origin.lng }

  if (!useRouteSnap || lastMobileRoutePath.length < 2) {
    return rawOrigin
  }

  const projection = findClosestRouteProjection(rawOrigin)

  if (!projection || projection.distanceMeters > mobileRouteSnapMaxDistanceMeters) {
    return rawOrigin
  }

  return projection.point
}

function getRouteForwardPoint(result: google.maps.DirectionsResult, target: NearbySearchItem) {
  const firstLeg = result.routes?.[0]?.legs?.[0]
  const firstStep = firstLeg?.steps?.find(step => step.end_location)
  const stepEnd = firstStep?.end_location

  if (stepEnd) {
    return { lat: stepEnd.lat(), lng: stepEnd.lng() }
  }

  if (target.lat !== null && target.lng !== null) {
    return { lat: target.lat, lng: target.lng }
  }

  return null
}

function getRoutePathPoints(result: google.maps.DirectionsResult, target: NearbySearchItem) {
  const firstLeg = result.routes?.[0]?.legs?.[0]
  const stepPath = firstLeg?.steps
    ?.flatMap(step => step.path?.map(point => ({ lat: point.lat(), lng: point.lng() })) ?? [])
    ?? []

  if (stepPath.length > 1) {
    return stepPath
  }

  const overviewPath = result.routes?.[0]?.overview_path
    ?.map(point => ({ lat: point.lat(), lng: point.lng() }))
    ?? []

  if (overviewPath.length > 1) {
    return overviewPath
  }

  const fallback = getRouteForwardPoint(result, target)

  const displayOrigin = resolveDisplayOrigin(false)

  if (displayOrigin && fallback) {
    return [displayOrigin, fallback]
  }

  return []
}

function getRoutePathLookAheadPoint(origin: { lat: number, lng: number }) {
  const projection = findClosestRouteProjection(origin)

  if (!projection) {
    return null
  }

  let travelledMeters = 0
  let from = projection.point

  for (let index = projection.index; index < lastMobileRoutePath.length - 1; index += 1) {
    const to = lastMobileRoutePath[index + 1]
    const segmentMeters = calculatePointDistanceMeters(from, to)

    if (travelledMeters + segmentMeters >= mobileRouteHeadingLookAheadMeters) {
      const remainingMeters = mobileRouteHeadingLookAheadMeters - travelledMeters
      const ratio = segmentMeters <= 0 ? 0 : Math.max(0, Math.min(1, remainingMeters / segmentMeters))

      return {
        lat: from.lat + (to.lat - from.lat) * ratio,
        lng: from.lng + (to.lng - from.lng) * ratio,
      }
    }

    travelledMeters += segmentMeters
    from = to
  }

  return lastMobileRoutePath[lastMobileRoutePath.length - 1] ?? null
}

function resolveMobileRouteHeading(target: NearbySearchItem | null) {
  const origin = resolveDisplayOrigin(true)
  const pathLookAheadPoint = origin ? getRoutePathLookAheadPoint(origin) : null
  const routeHeading = origin && pathLookAheadPoint
    ? calculateBearingDegrees(origin, pathLookAheadPoint)
    : origin && target && target.lat !== null && target.lng !== null
      ? calculateBearingDegrees(origin, { lat: target.lat, lng: target.lng })
      : null

  if (routeHeading !== null) {
    return lastMobileRouteHeading === null
      ? routeHeading
      : moveHeadingToward(lastMobileRouteHeading, routeHeading, mobileRouteHeadingMaxStep)
  }

  if (lastMobileRouteHeading !== null) {
    return lastMobileRouteHeading
  }

  if (props.originHeading !== null && props.originHeading !== undefined) {
    return props.originHeading
  }

  return mapInstance.value?.getHeading() ?? 0
}

function animateMobileRouteCamera(cameraOptions: google.maps.CameraOptions) {
  const map = mapInstance.value

  if (!map || !cameraOptions.center) {
    return
  }

  const nextCenter = cameraOptions.center as { lat: number, lng: number }
  const nextHeading = normalizeHeading(Number(cameraOptions.heading ?? 0))
  const startCenter = displayedMobileCameraCenter
    ?? map.getCenter()?.toJSON()
    ?? nextCenter
  const startHeading = displayedMobileCameraHeading
    ?? normalizeHeading(map.getHeading() ?? nextHeading)
  const startedAt = performance.now()

  if (mobileRouteCameraAnimationFrame) {
    cancelAnimationFrame(mobileRouteCameraAnimationFrame)
  }

  const applyCamera = (center: { lat: number, lng: number }, heading: number) => {
    const nextCameraOptions: google.maps.CameraOptions = {
      ...cameraOptions,
      center,
      heading,
    }

    if (typeof map.moveCamera === "function") {
      map.moveCamera(nextCameraOptions)
    }
    else {
      map.setCenter(center)
      map.setZoom(Number(cameraOptions.zoom ?? mobileRouteFollowZoom))
      map.setHeading(heading)
      map.setTilt(Number(cameraOptions.tilt ?? mobileRouteFollowTilt))
    }
  }

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / mobileRouteCameraAnimationMs)
    const easedProgress = easeOutCubic(progress)
    const center = interpolatePoint(startCenter, nextCenter, easedProgress)
    const heading = interpolateHeading(startHeading, nextHeading, easedProgress)

    applyCamera(center, heading)
    displayedMobileCameraCenter = center
    displayedMobileCameraHeading = heading

    if (progress < 1) {
      mobileRouteCameraAnimationFrame = requestAnimationFrame(tick)
      return
    }

    mobileRouteCameraAnimationFrame = 0
    displayedMobileCameraCenter = nextCenter
    displayedMobileCameraHeading = nextHeading
  }

  mobileRouteCameraAnimationFrame = requestAnimationFrame(tick)
}

function followMobileRouteCamera(target: NearbySearchItem | null) {
  const map = mapInstance.value

  if (!map || props.origin.lat === null || props.origin.lng === null) {
    return false
  }

  const now = Date.now()
  const origin = resolveDisplayOrigin(true) ?? { lat: props.origin.lat, lng: props.origin.lng }
  const heading = resolveMobileRouteHeading(target)
  const movedMeters = lastMobileRouteCameraCenter
    ? calculatePointDistanceMeters(lastMobileRouteCameraCenter, origin)
    : Number.POSITIVE_INFINITY
  const headingDelta = lastMobileRouteHeading === null
    ? Number.POSITIVE_INFINITY
    : calculateHeadingDelta(lastMobileRouteHeading, heading)

  if (
    lastMobileRouteCameraCenter
    && now - lastMobileRouteCameraAt < mobileRouteCameraMinIntervalMs
    && movedMeters < mobileRouteCameraMinMoveMeters
    && headingDelta < mobileRouteHeadingMinDelta
  ) {
    return true
  }

  const cameraOptions: google.maps.CameraOptions = {
    center: origin,
    heading,
    tilt: mobileRouteFollowTilt,
    zoom: mobileRouteFollowZoom,
  }

  animateMobileRouteCamera(cameraOptions)

  lastMobileRouteHeading = heading
  lastMobileRouteCameraCenter = origin
  lastMobileRouteCameraAt = now

  return true
}

function resetMobileRouteCamera() {
  const map = mapInstance.value

  if (!map) {
    return
  }

  map.setHeading(0)
  map.setTilt(0)
}

function handleGooglePoiClick(event: google.maps.MapMouseEvent & { placeId?: string, stop?: () => void }) {
  const placeId = event.placeId

  if (!placeId || !placesService.value) {
    return
  }

  event.stop?.()
  placesService.value.getDetails(
    {
      placeId,
      fields: ["formatted_address", "geometry", "place_id", "name"],
    },
    (place, status) => {
      const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK

      if (status !== okStatus || !place?.geometry?.location) {
        emit("routeError", "Không đọc được địa điểm Google Maps này.")
        return
      }

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const title = String(place.name || place.formatted_address || "Google Maps").trim()
      const address = String(place.formatted_address || title).trim()
      const item: NearbySearchItem = {
        id: `place-${place.place_id || placeId}`,
        backendId: 0,
        type: "place",
        title,
        subtitle: "Google Maps",
        description: "",
        locationLabel: address,
        avatarUrl: "",
        href: `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(String(place.place_id || placeId))}&query=${encodeURIComponent(address)}`,
        lat,
        lng,
        distanceMeters: calculateDistanceMeters(lat, lng),
      }

      emit("select", item)
    },
  )
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
    const radiusBounds = originRadiusCircle.value?.getBounds()

    if (radiusBounds) {
      map.fitBounds(radiusBounds, isMobileViewport() ? 40 : 64)
      return
    }

    map.setCenter(currentCenter.value)
    map.setZoom(isMobileViewport() ? 15 : 14)
    return
  }

  const bounds = new window.google.maps.LatLngBounds()
  coordinates.forEach(point => bounds.extend(point))
  const radiusBounds = originRadiusCircle.value?.getBounds()

  if (radiusBounds) {
    bounds.extend(radiusBounds.getNorthEast())
    bounds.extend(radiusBounds.getSouthWest())
  }

  map.fitBounds(bounds, isMobileViewport() ? 48 : 80)

  if (isMobileViewport()) {
    window.google.maps.event.addListenerOnce(map, "idle", () => {
      map.setZoom(Math.max(map.getZoom() ?? 13, 14))
    })
  }
}

function fitOriginRadius() {
  const map = mapInstance.value

  if (!map || !window.google?.maps || props.origin.lat === null || props.origin.lng === null) {
    return false
  }

  const radiusBounds = originRadiusCircle.value?.getBounds()

  if (radiusBounds) {
    map.fitBounds(radiusBounds, isMobileViewport() ? 40 : 64)
    return true
  }

  map.panTo({ lat: props.origin.lat, lng: props.origin.lng })
  map.setZoom(Math.max(map.getZoom() ?? 14, 15))

  return true
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
  fitOriginRadius()
}

function zoomIn() {
  const map = mapInstance.value

  if (!map) {
    return
  }

  map.setZoom(Math.min((map.getZoom() ?? 13) + 1, 21))
}

function zoomOut() {
  const map = mapInstance.value

  if (!map) {
    return
  }

  map.setZoom(Math.max((map.getZoom() ?? 13) - 1, 3))
}

function syncOriginRadiusCircle(force = false) {
  const map = mapInstance.value

  if (!map || !window.google?.maps) {
    return
  }

  if (props.origin.lat === null || props.origin.lng === null) {
    clearOriginRadiusCircle()
    lastOriginRadiusCenter = null
    lastOriginRadiusMeters = 0
    return
  }

  const center = { lat: props.origin.lat, lng: props.origin.lng }
  const radiusMeters = Math.max((props.searchRadiusKm ?? 1) * 1000, 100)
  const movedMeters = lastOriginRadiusCenter
    ? calculatePointDistanceMeters(lastOriginRadiusCenter, center)
    : Number.POSITIVE_INFINITY
  const radiusChanged = radiusMeters !== lastOriginRadiusMeters

  if (!force && originRadiusCircle.value && !radiusChanged && movedMeters < originRadiusMinMoveMeters) {
    return
  }

  if (originRadiusCircle.value) {
    originRadiusCircle.value.setOptions({
      map,
      center,
      radius: radiusMeters,
      clickable: false,
      fillColor: "#2563eb",
      fillOpacity: 0.08,
      strokeColor: "#2563eb",
      strokeOpacity: 0.45,
      strokeWeight: 2,
      zIndex: 1,
    })
  }
  else {
    originRadiusCircle.value = new window.google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      clickable: false,
      fillColor: "#2563eb",
      fillOpacity: 0.08,
      strokeColor: "#2563eb",
      strokeOpacity: 0.45,
      strokeWeight: 2,
      zIndex: 1,
    })
  }

  lastOriginRadiusCenter = center
  lastOriginRadiusMeters = radiusMeters
}

function animateOriginMarkerTo(
  marker: google.maps.Marker,
  center: { lat: number, lng: number },
  heading: number | null,
  selected: boolean,
) {
  const nextHeading = heading ?? displayedOriginHeading ?? 0

  if (!displayedOriginPosition) {
    displayedOriginPosition = center
    displayedOriginHeading = nextHeading
    marker.setPosition(center)
    marker.setIcon(createOriginIcon(selected, nextHeading))
    return
  }

  const movedMeters = calculatePointDistanceMeters(displayedOriginPosition, center)

  if (movedMeters > 120) {
    displayedOriginPosition = center
    displayedOriginHeading = nextHeading
    marker.setPosition(center)
    marker.setIcon(createOriginIcon(selected, nextHeading))
    return
  }

  const startPosition = displayedOriginPosition
  const startHeading = displayedOriginHeading ?? nextHeading
  const startedAt = performance.now()

  if (originMarkerAnimationFrame) {
    cancelAnimationFrame(originMarkerAnimationFrame)
  }

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / originMarkerAnimationMs)
    const easedProgress = easeOutCubic(progress)
    const position = interpolatePoint(startPosition, center, easedProgress)
    const nextAnimatedHeading = interpolateHeading(startHeading, nextHeading, easedProgress)

    marker.setPosition(position)
    marker.setIcon(createOriginIcon(selected, nextAnimatedHeading))
    displayedOriginPosition = position
    displayedOriginHeading = nextAnimatedHeading

    if (progress < 1) {
      originMarkerAnimationFrame = requestAnimationFrame(tick)
      return
    }

    originMarkerAnimationFrame = 0
    displayedOriginPosition = center
    displayedOriginHeading = nextHeading
  }

  originMarkerAnimationFrame = requestAnimationFrame(tick)
}

function renderOriginMarker() {
  const map = mapInstance.value
  const Marker = markerConstructor.value

  if (!map || !Marker || !window.google?.maps) {
    return
  }

  if (props.origin.lat === null || props.origin.lng === null) {
    clearOriginMarker()
    displayedOriginPosition = null
    displayedOriginHeading = null
    return
  }

  const center = resolveDisplayOrigin(true) ?? { lat: props.origin.lat, lng: props.origin.lng }
  const markerHeading = props.routeNavigationActive
    ? resolveMobileRouteHeading(props.routeTargetItem)
    : props.originHeading ?? null
  const icon = createOriginIcon(!props.selectedItemId, markerHeading)

  if (originMarker.value) {
    originMarker.value.setMap(map)
    originMarker.value.setTitle("Vi tri cua toi")
    originMarker.value.setZIndex(40)
    animateOriginMarkerTo(originMarker.value, center, markerHeading, !props.selectedItemId)
    return
  }

  originMarker.value = new Marker({
    map,
    position: center,
    title: "Vi tri cua toi",
    icon,
    zIndex: 40,
  })
  displayedOriginPosition = center
  displayedOriginHeading = markerHeading
}

function renderMarkers() {
  const map = mapInstance.value
  const Marker = markerConstructor.value

  if (!map || !Marker || !window.google?.maps) {
    return
  }

  const viewportKey = createMarkersViewportKey()
  const shouldUpdateViewport = viewportKey !== lastMarkersViewportKey

  renderOriginMarker()
  syncOriginRadiusCircle()
  clearMarkers()

  const markers: google.maps.Marker[] = []

  props.items.forEach((item) => {
    if (item.lat === null || item.lng === null) {
      return
    }

    const pinnedPage = item.type === "page" && item.pinned === true
    const marker = new Marker({
      map,
      position: { lat: item.lat, lng: item.lng },
      title: item.title,
      icon: createPinIcon(item.type === "page" ? "#16a34a" : item.type === "place" ? "#2563eb" : "#ef4444", item.id === props.selectedItemId),
      label: pinnedPage
        ? {
            text: item.title.slice(0, 22),
            color: "#0f172a",
            fontSize: "12px",
            fontWeight: "800",
            className: "nearby-map__pin-label",
          }
        : undefined,
      zIndex: item.id === props.selectedItemId ? 30 : 10,
    })

    marker.addListener("click", () => {
      emit("select", item)
    })
    markers.push(marker)
  })

  markerInstances.value = markers
  lastMarkersViewportKey = viewportKey

  if (!shouldUpdateViewport) {
    return
  }

  if (props.routeTargetItem) {
    if (props.routeNavigationActive && isMobileViewport()) {
      followMobileRouteCamera(props.routeTargetItem)
    }
    return
  }

  if (props.selectedItemId) {
    focusSelectedItem()
    return
  }

  if (props.origin.lat !== null && props.origin.lng !== null) {
    fitOriginRadius()
    return
  }

  fitMarkers()
}

function fitRouteResult(result: google.maps.DirectionsResult, target: NearbySearchItem) {
  const map = mapInstance.value

  if (!map || !window.google?.maps) {
    return
  }

  const padding = isMobileViewport()
    ? { top: 96, right: 82, bottom: 230, left: 24 }
    : { top: 96, right: 96, bottom: 96, left: 96 }
  const routeBounds = result.routes?.[0]?.bounds

  if (routeBounds) {
    map.fitBounds(routeBounds, padding)
    return
  }

  const bounds = new window.google.maps.LatLngBounds()

  if (props.origin.lat !== null && props.origin.lng !== null) {
    bounds.extend({ lat: props.origin.lat, lng: props.origin.lng })
  }
  if (target.lat !== null && target.lng !== null) {
    bounds.extend({ lat: target.lat, lng: target.lng })
  }

  map.fitBounds(bounds, padding)
}

function getRoutePreviewMinZoom(target: NearbySearchItem) {
  if (props.origin.lat === null || props.origin.lng === null || target.lat === null || target.lng === null) {
    return 0
  }

  const distanceMeters = calculatePointDistanceMeters(
    { lat: props.origin.lat, lng: props.origin.lng },
    { lat: target.lat, lng: target.lng },
  )

  if (distanceMeters <= 1500) {
    return isMobileViewport() ? 16 : 17
  }

  if (distanceMeters <= 5000) {
    return 15
  }

  return 0
}

function fitRoutePreview(result: google.maps.DirectionsResult, target: NearbySearchItem) {
  const map = mapInstance.value

  if (!map || !window.google?.maps) {
    return
  }

  if (props.routeNavigationActive && isMobileViewport()) {
    lastMobileRoutePath = getRoutePathPoints(result, target)

    if (props.origin.lat !== null && props.origin.lng !== null) {
      const origin = resolveDisplayOrigin(true) ?? { lat: props.origin.lat, lng: props.origin.lng }
      const routeForwardPoint = getRoutePathLookAheadPoint(origin) ?? getRouteForwardPoint(result, target)
      lastMobileRouteHeading = routeForwardPoint
        ? calculateBearingDegrees(origin, routeForwardPoint)
        : null
    }

    if (followMobileRouteCamera(target)) {
      return
    }
  }

  fitRouteResult(result, target)

  const minZoom = getRoutePreviewMinZoom(target)

  if (minZoom <= 0) {
    return
  }

  window.google.maps.event.addListenerOnce(map, "idle", () => {
    map.setZoom(Math.max(map.getZoom() ?? minZoom, minZoom))
  })
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
  const shouldFitRouteViewport = props.routeFitKey !== lastRouteFitKey
    || lastRenderedRouteTargetId !== target.id
    || !directionsRenderer.value
  const renderer = directionsRenderer.value ?? new DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: isMobileViewport() ? "#3b00ff" : "#2563eb",
        strokeOpacity: 1,
        strokeWeight: isMobileViewport() ? 9 : 5,
      },
    })

  renderer.setMap(map)
  directionsRenderer.value = renderer

  service.route(
    {
      origin: { lat: props.origin.lat, lng: props.origin.lng },
      destination: { lat: target.lat, lng: target.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (requestId !== routeRequestSequence || props.routeTargetItem?.id !== target.id) {
        return
      }

      if (status === window.google.maps.DirectionsStatus.OK && result) {
        lastRenderedRouteTargetId = target.id
        renderer.setDirections(result)
        if (shouldFitRouteViewport) {
          lastRouteFitKey = props.routeFitKey
          fitRoutePreview(result, target)
        }
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

  // Đợi window.google.maps sẵn sàng (tối đa 5 giây)
  let retries = 25
  while (!window.google?.maps && retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    retries--
  }

  if (!window.google?.maps) {
    mapError.value = "Google Maps chua san sang."
    return
  }

  let constructors: Awaited<ReturnType<typeof resolveMapConstructors>> = null
  retries = 15

  // Đợi thêm để resolveMapConstructors có thể lấy đủ các libraries như maps, marker, routes
  while (retries > 0) {
    try {
      constructors = await resolveMapConstructors()
      if (constructors) {
        break
      }
    }
    catch {
      // Bỏ qua lỗi tạm thời khi các library chưa load xong
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
    retries--
  }

  if (!constructors) {
    mapError.value = "Google Maps chua san sang."
    return
  }

  markerConstructor.value = constructors.Marker
  directionsServiceConstructor.value = constructors.DirectionsService
  directionsRendererConstructor.value = constructors.DirectionsRenderer
  const mobileVectorOptions = isMobileViewport() && googleMapsMapId.value
    ? {
        mapId: googleMapsMapId.value,
        renderingType: window.google.maps.RenderingType?.VECTOR,
        tilt: 0,
      }
    : {}
  mapInstance.value = new constructors.Map(mapElement.value, {
    center: currentCenter.value,
    zoom: isMobileViewport() ? 15 : 13,
    clickableIcons: true,
    draggable: true,
    fullscreenControl: false,
    gestureHandling: "greedy",
    mapTypeControl: false,
    ...mobileVectorOptions,
    scrollwheel: true,
    streetViewControl: false,
    zoomControl: false,
  })
  placesService.value = window.google?.maps?.places?.PlacesService
    ? new window.google.maps.places.PlacesService(mapInstance.value)
    : null
  mapInstance.value.addListener("click", handleGooglePoiClick)

  renderMarkers()
  renderRoute()
}

onMounted(() => {
  void initializeMap()
})

watch(
  () => [props.items, props.selectedItemId],
  () => renderMarkers(),
  { deep: true },
)

watch(
  () => [props.origin.lat, props.origin.lng, props.originUpdateKey],
  () => {
    renderOriginMarker()
    syncOriginRadiusCircle()
    if (props.routeNavigationActive && props.routeTargetItem && isMobileViewport()) {
      followMobileRouteCamera(props.routeTargetItem)
    }
  },
)

watch(
  () => props.originHeading,
  () => renderOriginMarker(),
)

watch(
  () => props.searchRadiusKm,
  () => syncOriginRadiusCircle(true),
)

watch(
  () => props.originFocusKey,
  () => {
    renderOriginMarker()
    syncOriginRadiusCircle(true)
    if (props.routeTargetItem) {
      return
    }
    focusOrigin()
  },
  { flush: "post" },
)

watch(
  () => props.zoomInKey,
  () => zoomIn(),
)

watch(
  () => props.zoomOutKey,
  () => zoomOut(),
)

watch(
  () => [
    props.routeTargetItem?.id,
    props.routeTargetItem?.lat,
    props.routeTargetItem?.lng,
    props.routeNavigationActive,
    props.routeOriginUpdateKey,
    props.routeFitKey,
    props.items.map(item => `${item.id}:${item.pinned ? 1 : 0}`).join(","),
  ],
  () => renderRoute(),
)

onBeforeUnmount(() => {
  clearOriginMarker()
  clearMarkers()
  clearOriginRadiusCircle()
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
  overscroll-behavior: contain;
  touch-action: none;
  user-select: none;
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

:global(.nearby-map__pin-label) {
  position: relative;
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.16);
  padding: 6px 10px;
  transform: translateX(2px);
  white-space: nowrap;
}

:global(.nearby-map__pin-label::before) {
  position: absolute;
  top: 50%;
  left: -6px;
  width: 10px;
  height: 10px;
  border-bottom: 1px solid rgba(203, 213, 225, 0.9);
  border-left: 1px solid rgba(203, 213, 225, 0.9);
  background: rgba(255, 255, 255, 0.92);
  content: "";
  transform: translateY(-50%) rotate(45deg);
}
</style>
