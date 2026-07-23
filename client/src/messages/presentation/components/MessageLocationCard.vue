<!-- Description: Renders native-compatible /map chat messages as an accessible location preview card. -->
<template>
  <NuxtLink
    :to="resolvedWebMapUrl"
    class="message-location-card"
    :aria-label="`${resolvedTitle}. ${t('pages.messagesPage.locationOpenMap')}`"
  >
    <span class="message-location-card__map" aria-hidden="true">
      <span ref="mapElement" class="message-location-card__canvas" />
      <span v-if="mapFailed" class="message-location-card__map-fallback">
        <Icon name="i-ph-map-trifold-duotone" />
      </span>
      <span class="message-location-card__shade" />
      <span class="message-location-card__marker">
        <Icon name="i-ph-map-pin-fill" />
        <img
          v-if="resolvedAvatarUrl"
          :key="resolvedAvatarUrl"
          :src="resolvedAvatarUrl"
          alt=""
          @error="useNextAvatarSource"
        >
      </span>
    </span>

    <span class="message-location-card__footer">
      <span class="message-location-card__copy">
        <strong>{{ resolvedTitle }}</strong>
        <small>{{ t("pages.messagesPage.locationOpenMap") }}</small>
      </span>
      <Icon name="i-ph-arrow-square-out-bold" class="message-location-card__open" />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { MessageLocationMeta } from "../../application/utils/message-location"

const props = defineProps<{
  location: MessageLocationMeta
  avatarUrl?: string
  isMine?: boolean
  senderName?: string
}>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const avatarSourceIndex = ref(0)
const mapElement = ref<HTMLElement | null>(null)
const mapFailed = ref(false)
const mapInstance = shallowRef<google.maps.Map | null>(null)
const resolvedTitle = computed(() => {
  if (props.isMine) {
    return props.location.title.trim() || t("pages.messagesPage.locationOwnTitle")
  }

  const senderName = props.senderName?.trim()

  return senderName
    ? t("pages.messagesPage.locationSenderTitle", { name: senderName })
    : t("pages.messagesPage.locationDefaultTitle")
})
const avatarSources = computed(() => [...new Set([
  props.avatarUrl?.trim(),
  props.location.avatarUrl.trim(),
].filter((value): value is string => Boolean(value)))])
const resolvedAvatarUrl = computed(() => avatarSources.value[avatarSourceIndex.value] || "")
const resolvedWebMapUrl = computed(() => {
  const url = new URL(props.location.webMapUrl, "https://vnseea.invalid")
  url.searchParams.set("title", String(resolvedTitle.value))

  const avatarUrl = props.avatarUrl?.trim() || props.location.avatarUrl.trim()
  if (avatarUrl) {
    url.searchParams.set("avatar", avatarUrl)
  }

  return `${url.pathname}${url.search}`
})
const googleMapsMapId = computed(() => String(runtimeConfig.public.scripts?.googleMaps?.mapId || "").trim())
const { load } = useScriptGoogleMaps({ trigger: "manual" })
let visibilityObserver: IntersectionObserver | null = null

async function initializeMap() {
  if (!import.meta.client || !mapElement.value) {
    return
  }

  mapFailed.value = false

  try {
    await load()

    let attempts = 20
    while (!window.google?.maps && attempts > 0) {
      await new Promise(resolve => setTimeout(resolve, 150))
      attempts -= 1
    }

    if (!window.google?.maps || !mapElement.value) {
      throw new Error("Google Maps is unavailable")
    }

    const position = {
      lat: props.location.latitude,
      lng: props.location.longitude,
    }
    mapInstance.value = new window.google.maps.Map(mapElement.value, {
      center: position,
      zoom: 15,
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
}

function useNextAvatarSource() {
  avatarSourceIndex.value += 1
}

watch(
  () => [props.avatarUrl, props.location.avatarUrl],
  () => {
    avatarSourceIndex.value = 0
  },
)

watch(
  () => [props.location.latitude, props.location.longitude],
  () => {
    if (mapInstance.value) {
      void initializeMap()
    }
  },
)

onMounted(() => {
  if (!("IntersectionObserver" in window) || !mapElement.value) {
    void initializeMap()
    return
  }

  visibilityObserver = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) {
      return
    }

    visibilityObserver?.disconnect()
    visibilityObserver = null
    void initializeMap()
  }, { rootMargin: "160px" })
  visibilityObserver.observe(mapElement.value)
})

onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  visibilityObserver = null
  mapInstance.value = null
})
</script>

<style scoped>
.message-location-card {
  display: block;
  width: min(300px, 100%);
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #d8e1ee;
  border-radius: 18px;
  background: var(--bg-surface);
  color: var(--text-primary);
  text-decoration: none;
  box-shadow: 0 5px 18px rgba(15, 23, 42, 0.12);
  transition: box-shadow 0.16s ease, transform 0.16s ease;
}

.message-location-card:hover {
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.17);
  transform: translateY(-1px);
}

.message-location-card__map {
  position: relative;
  display: block;
  height: 145px;
  overflow: hidden;
  background: #dcebdc;
}

.message-location-card__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.message-location-card__map-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    linear-gradient(30deg, transparent 48%, rgba(255, 255, 255, 0.72) 49% 51%, transparent 52%),
    linear-gradient(150deg, #d7ead8, #dceafb);
  color: #3567e8;
}

.message-location-card__map-fallback :deep(svg) {
  width: 42px;
  height: 42px;
}

.message-location-card__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 58%, rgba(15, 23, 42, 0.08));
}

.message-location-card__marker {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  overflow: hidden;
  border: 4px solid #ffffff;
  border-radius: 999px;
  background: #3567e8;
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.28);
  transform: translate(-50%, -50%);
}

.message-location-card__marker img {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-location-card__marker :deep(svg) {
  width: 26px;
  height: 26px;
}

.message-location-card__footer {
  display: flex;
  min-height: 68px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #d9f4ff, #c5ecfb);
}

.message-location-card__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.message-location-card__copy strong {
  overflow: hidden;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-location-card__copy small {
  color: #526172;
  font-size: 12px;
  font-weight: 600;
}

.message-location-card__open {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  color: var(--bg-brand);
}

@media (max-width: 480px) {
  .message-location-card {
    width: min(270px, 100%);
  }

  .message-location-card__map {
    height: 132px;
  }
}
</style>
