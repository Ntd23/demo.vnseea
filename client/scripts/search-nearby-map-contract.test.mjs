// English description: Guards nearby-map startup and realtime geolocation contracts.
import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const mapSource = fs.readFileSync(
  new URL("../src/search-nearby/presentation/components/NearbySearchMap.vue", import.meta.url),
  "utf8",
)
const pageSource = fs.readFileSync(
  new URL("../src/search-nearby/presentation/pages/SearchNearbyPage.vue", import.meta.url),
  "utf8",
)
const viewModelSource = fs.readFileSync(
  new URL("../src/search-nearby/application/view-models/useSearchNearbyPageVM.ts", import.meta.url),
  "utf8",
)
const resultCardSource = fs.readFileSync(
  new URL("../src/search-nearby/presentation/components/NearbyResultCard.vue", import.meta.url),
  "utf8",
)

test("Google Map initialization stops when its Vue host has unmounted", () => {
  assert.match(mapSource, /let isMapComponentMounted = false/)
  assert.match(
    mapSource,
    /const targetElement = mapElement\.value[\s\S]*!isMapComponentMounted[\s\S]*targetElement instanceof HTMLElement/,
  )
  assert.match(mapSource, /new constructors\.Map\(targetElement,/)
  assert.match(mapSource, /onBeforeUnmount\(\(\) => \{\s*isMapComponentMounted = false/)
})

test("missing route coordinates cannot be interpreted as zero coordinates", () => {
  assert.match(viewModelSource, /const rawValue = readString\(value\)\.trim\(\)/)
  assert.match(viewModelSource, /if \(!rawValue\) \{\s*return null\s*\}/)
})

test("nearby search always starts realtime device geolocation", () => {
  assert.match(
    pageSource,
    /onMounted\(\(\) => \{\s*void loadSearchNearbyConfig\(\)\s*void startDeviceOrientationTracking\(\)\s*void requestLocationPermission\(\)/,
  )
  assert.match(viewModelSource, /const needsLocation = computed\(\(\) => !hasOrigin\.value\)/)
  assert.match(
    viewModelSource,
    /if \(requestQuery\.originLat === null \|\| requestQuery\.originLng === null\) \{\s*response\.value = emptyResponse\(\)/,
  )
})

test("selecting a pointer or Google POI only opens its result", () => {
  const selectItemSource = viewModelSource.match(/function selectItem[\s\S]*?function selectSuggestion/)?.[0] || ""
  const selectSuggestionSource = viewModelSource.match(/function selectSuggestion[\s\S]*?function requestDirections/)?.[0] || ""
  const poiClickSource = mapSource.match(/function handleGooglePoiClick[\s\S]*?function fitMarkers/)?.[0] || ""

  assert.match(selectItemSource, /routeTargetItem\.value = null/)
  assert.match(selectItemSource, /routeNavigationActive\.value = false/)
  assert.match(selectSuggestionSource, /routeTargetItem\.value = null/)
  assert.match(selectSuggestionSource, /routeNavigationActive\.value = false/)
  assert.match(mapSource, /function beginResultSelection\(\) \{\s*clearRoute\(\)\s*emit\("clearRoute"\)/)
  assert.match(mapSource, /function selectResult\(item: NearbySearchItem\)[\s\S]*emit\("select", item\)/)
  assert.match(poiClickSource, /emit\("select", item\)/)
  assert.doesNotMatch(poiClickSource, /emit\("directions", item\)/)
  assert.match(pageSource, /@clear-route="clearRoute"/)
})

test("only the directions action starts routing with forward camera heading", () => {
  const directionsSource = viewModelSource.match(/function requestDirections[\s\S]*?function clearRoute/)?.[0] || ""

  assert.match(directionsSource, /routeTargetItem\.value = item/)
  assert.match(directionsSource, /routeNavigationActive\.value = true/)
  assert.match(mapSource, /if \(!props\.routeNavigationActive \|\| !target\) \{\s*clearRoute\(\)/)
  assert.match(mapSource, /requestId !== routeRequestSequence[\s\S]*!props\.routeNavigationActive[\s\S]*props\.routeTargetItem\?\.id !== target\.id/)
  assert.match(mapSource, /const cameraHeading = routeHeading/)
  assert.doesNotMatch(mapSource, /mobileRouteCameraHeadingOffsetDegrees/)
})

test("manual map dragging pauses route camera follow until recenter", () => {
  const followCameraSource = mapSource.match(/function followMobileRouteCamera[\s\S]*?function resetMobileRouteCamera/)?.[0] || ""
  const originFocusSource = mapSource.match(/\(\) => props\.originFocusKey[\s\S]*?\{ flush: "post" \}/)?.[0] || ""
  const focusOriginSource = viewModelSource.match(/function focusOrigin[\s\S]*?function setCurrentDeviceLocation/)?.[0] || ""

  assert.match(mapSource, /mapInstance\.value\.addListener\("dragstart", pauseMobileRouteCameraFollow\)/)
  assert.match(followCameraSource, /isMobileRouteCameraFollowPaused/)
  assert.match(originFocusSource, /resumeMobileRouteCameraFollow\(\)/)
  assert.match(originFocusSource, /followMobileRouteCamera\(props\.routeTargetItem, true\)/)
  assert.match(focusOriginSource, /if \(!routeNavigationActive\.value\)/)
})

test("generic Google Places searches stay inside one kilometre of the realtime origin", () => {
  assert.match(pageSource, /const googleNearbyRadiusMeters = 1000/)
  assert.match(
    pageSource,
    /placesService\.value\.nearbySearch\([\s\S]*location: new window\.google\.maps\.LatLng\(origin\.value\.lat, origin\.value\.lng\)[\s\S]*radius: googleNearbyRadiusMeters/,
  )
  assert.match(
    pageSource,
    /distanceMeters > googleNearbyRadiusMeters[\s\S]*return null/,
  )
  assert.match(
    pageSource,
    /shouldShowGoogleNearbyResults\.value\s*\? googleNearbyResults\.value\s*:\s*mapItems\.value/,
  )
  assert.match(
    pageSource,
    /shouldShowGoogleNearbyResults\.value \? googleNearbyRadiusMeters \/ 1000 : distanceKm\.value/,
  )
})

test("nearby discovery only searches Pages and opens Page profiles in a new tab", () => {
  assert.match(viewModelSource, /const nearbyQuery = computed<NearbySearchQuery>\([\s\S]*type: "page"/)
  assert.match(viewModelSource, /items: nextResponse\.items\.filter\(item => item\.type === "page"\)/)
  assert.match(viewModelSource, /nextResponse\.items\.filter\(item => item\.type === "page"\)/)
  assert.doesNotMatch(viewModelSource, /selectedType|selectType/)
  assert.match(resultCardSource, /v-if="item\.type === 'page' && item\.href"/)
  assert.match(resultCardSource, /:href="item\.href"[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/)
})
