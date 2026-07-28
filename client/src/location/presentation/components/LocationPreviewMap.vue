<!-- English description: Renders a reusable non-interactive Google map preview for a selected location. -->
<template>
  <article class="location-preview-map">
    <button
      type="button"
      class="location-preview-map__map"
      :aria-label="t('pages.locationMapPicker.selectedAddress')"
      @click="emit('edit')"
    >
      <span ref="mapElement" class="location-preview-map__canvas" aria-hidden="true" />
      <span v-if="isLoading" class="location-preview-map__state" aria-hidden="true">
        <UIcon name="i-ph-circle-notch-bold" class="location-preview-map__spinner" />
      </span>
      <span v-else-if="mapFailed" class="location-preview-map__state" aria-hidden="true">
        <UIcon name="i-ph-map-trifold-duotone" class="h-10 w-10" />
      </span>
      <span class="location-preview-map__marker" aria-hidden="true">
        <UIcon name="i-ph-map-pin-fill" />
      </span>
    </button>

    <div class="location-preview-map__footer">
      <span class="location-preview-map__footer-icon" aria-hidden="true">
        <UIcon name="i-ph-map-pin-area-duotone" />
      </span>
      <button type="button" class="location-preview-map__copy" @click="emit('edit')">
        <strong>{{ normalizedLocation.address }}</strong>
        <small>{{ t("pages.locationMapPicker.selectedAddress") }}</small>
      </button>
    </div>

    <UButton
      type="button"
      icon="i-ph-x-bold"
      color="neutral"
      variant="solid"
      size="sm"
      square
      class="location-preview-map__remove"
      :aria-label="t('pages.googlePlaceField.clearAddress')"
      @click.stop="emit('remove')"
    />
  </article>
</template>

<script setup lang="ts">
import {
  hasLocationCoordinates,
  normalizeLocationSelection,
  type LocationSelection,
} from "../../domain/types/location.types"

const props = defineProps<{
  location: LocationSelection
}>()

const emit = defineEmits<{
  edit: []
  remove: []
}>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const mapElement = ref<HTMLSpanElement | null>(null)
const mapInstance = shallowRef<google.maps.Map | null>(null)
const isLoading = ref(false)
const mapFailed = ref(false)
const { load } = useScriptGoogleMaps({ trigger: "manual" })

const normalizedLocation = computed(() =>
  normalizeLocationSelection(props.location),
)

const mapPosition = computed<google.maps.LatLngLiteral | null>(() => {
  if (!hasLocationCoordinates(normalizedLocation.value)) {
    return null
  }

  return {
    lat: normalizedLocation.value.lat as number,
    lng: normalizedLocation.value.lng as number,
  }
})

const googleMapsMapId = computed(() =>
  String(runtimeConfig.public.scripts?.googleMaps?.mapId || "").trim(),
)

watch(
  mapPosition,
  (position) => {
    if (!position) {
      mapFailed.value = true
      return
    }

    if (mapInstance.value) {
      mapInstance.value.setCenter(position)
      return
    }

    void initializeMap()
  },
  { deep: true },
)

onMounted(() => {
  void initializeMap()
})

onBeforeUnmount(() => {
  if (import.meta.client && mapInstance.value && window.google?.maps?.event) {
    window.google.maps.event.clearInstanceListeners(mapInstance.value)
  }

  mapInstance.value = null
})

async function initializeMap() {
  const position = mapPosition.value

  if (!import.meta.client || !mapElement.value || !position) {
    mapFailed.value = true
    return
  }

  isLoading.value = true
  mapFailed.value = false

  try {
    await load()
    await nextTick()

    const mapsRuntime = window.google?.maps

    if (!mapsRuntime?.Map || !mapElement.value) {
      throw new Error("Google Maps is unavailable")
    }

    mapInstance.value = new mapsRuntime.Map(mapElement.value, {
      center: position,
      zoom: 16,
      clickableIcons: false,
      disableDefaultUI: true,
      gestureHandling: "none",
      keyboardShortcuts: false,
      ...(googleMapsMapId.value ? { mapId: googleMapsMapId.value } : {}),
    })
  }
  catch {
    mapFailed.value = true
  }
  finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.location-preview-map {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.location-preview-map__map {
  position: relative;
  display: block;
  width: 100%;
  height: 240px;
  overflow: hidden;
  border: 0;
  background: var(--bg-muted);
  cursor: pointer;
}

.location-preview-map__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.location-preview-map__state {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--bg-muted);
  color: var(--text-brand);
}

.location-preview-map__spinner {
  width: 30px;
  height: 30px;
  animation: location-preview-map-spin 0.8s linear infinite;
}

.location-preview-map__marker {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 3px solid var(--text-inverse);
  border-radius: 999px;
  background: var(--bg-brand);
  color: var(--text-inverse);
  box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.location-preview-map__marker :deep(svg) {
  width: 28px;
  height: 28px;
}

.location-preview-map__footer {
  display: flex;
  min-height: 76px;
  align-items: center;
  gap: 12px;
  padding: 12px 52px 12px 14px;
  border-top: 1px solid var(--border-light);
}

.location-preview-map__footer-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border-radius: 999px;
  background: var(--bg-surface-active);
  color: var(--text-brand);
}

.location-preview-map__footer-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.location-preview-map__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.location-preview-map__copy strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-preview-map__copy small {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.location-preview-map__remove {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 2;
  border: 1px solid color-mix(in srgb, var(--text-inverse) 35%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-media) 82%, transparent);
  color: var(--text-media);
  box-shadow: var(--shadow-md);
}

@keyframes location-preview-map-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 639px) {
  .location-preview-map__map {
    height: 190px;
  }
}
</style>
