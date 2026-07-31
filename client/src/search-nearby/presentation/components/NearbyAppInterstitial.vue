<!-- English description: Encourages mobile-web nearby-map visitors to open the native app while preserving an explicit web fallback. -->
<template>
  <UDrawer
    v-model:open="open"
    :dismissible="false"
    :title="t('pages.searchNearby.appPromptTitle')"
    :description="t('pages.searchNearby.appPromptDescription')"
    :ui="{
      content: 'nearby-app-prompt__content',
      header: 'hidden',
      body: 'p-0 sm:p-0',
    }"
  >
    <template #body>
      <div class="nearby-app-prompt">
        <div class="nearby-app-prompt__visual">
          <span class="nearby-app-prompt__pulse nearby-app-prompt__pulse--one" />
          <span class="nearby-app-prompt__pulse nearby-app-prompt__pulse--two" />
          <div class="nearby-app-prompt__brand">
            <img
              v-if="displayLogoUrl && !logoFailed"
              :src="displayLogoUrl"
              :alt="logoAlt"
              class="nearby-app-prompt__logo"
              @error="logoFailed = true"
            >
            <span v-else class="nearby-app-prompt__fallback" aria-hidden="true">
              {{ brandInitial }}
            </span>
          </div>
          <span class="nearby-app-prompt__pin" aria-hidden="true">
            <UIcon name="i-ph-map-pin-fill" />
          </span>
        </div>

        <h2 class="nearby-app-prompt__title">
          {{ t("pages.searchNearby.appPromptTitle") }}
        </h2>
        <p class="nearby-app-prompt__description">
          {{ t("pages.searchNearby.appPromptDescription") }}
        </p>

        <p v-if="configurationMissing" class="nearby-app-prompt__notice" role="status">
          {{ t("pages.searchNearby.appPromptNotConfigured") }}
        </p>

        <div class="nearby-app-prompt__actions">
          <UButton
            type="button"
            size="lg"
            block
            icon="i-ph-device-mobile-camera-bold"
            class="nearby-app-prompt__primary"
            :disabled="!canOpenApp"
            @click="openNativeApp"
          >
            {{ t("pages.searchNearby.openApp") }}
          </UButton>
          <UButton
            type="button"
            size="lg"
            block
            color="neutral"
            variant="ghost"
            class="nearby-app-prompt__secondary"
            @click="continueOnWeb"
          >
            {{ t("pages.searchNearby.continueOnWeb") }}
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  continue: []
}>()

type NativeAppRuntimeConfig = {
  nearbyDeepLink?: string
  iosStoreUrl?: string
  androidStoreUrl?: string
}

type MobileStorePlatform = "ios" | "android"

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const logoFailed = ref(false)
const publicRuntimeConfig = runtimeConfig.public as typeof runtimeConfig.public & {
  nativeApp?: NativeAppRuntimeConfig
}
const nativeAppConfig = computed(() => publicRuntimeConfig.nativeApp)
const displayLogoUrl = "/themes/wowonder/img/icon.png"
const logoAlt = "VNSEEA"
const brandInitial = "V"
const nearbyDeepLink = computed(() => String(nativeAppConfig.value?.nearbyDeepLink || "").trim())
const iosStoreUrl = computed(() => String(nativeAppConfig.value?.iosStoreUrl || "").trim())
const androidStoreUrl = computed(() => String(nativeAppConfig.value?.androidStoreUrl || "").trim())
const mobilePlatform = computed<MobileStorePlatform>(() => {
  if (!import.meta.client) {
    return "android"
  }

  const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  return isIos ? "ios" : "android"
})
const platformStoreUrl = computed(() =>
  mobilePlatform.value === "ios" ? iosStoreUrl.value : androidStoreUrl.value,
)
const canOpenApp = computed(() => Boolean(platformStoreUrl.value))
const configurationMissing = computed(() => !canOpenApp.value)

let storeFallbackTimer: ReturnType<typeof setTimeout> | undefined

function clearStoreFallback() {
  if (!storeFallbackTimer) return
  clearTimeout(storeFallbackTimer)
  storeFallbackTimer = undefined
}

function handleVisibilityChange() {
  if (document.hidden) {
    clearStoreFallback()
  }
}

function buildAppHandoffUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) {
    return url
  }

  try {
    const handoffUrl = new URL(url, window.location.origin)
    handoffUrl.searchParams.set("native_app_fallback", mobilePlatform.value)
    return handoffUrl.toString()
  }
  catch {
    return url
  }
}

function continueOnWeb() {
  open.value = false
  emit("continue")
}

function openNativeApp() {
  if (!import.meta.client || !canOpenApp.value) {
    return
  }

  open.value = false
  clearStoreFallback()

  if (!nearbyDeepLink.value) {
    window.location.assign(platformStoreUrl.value)
    return
  }

  const appUrl = buildAppHandoffUrl(nearbyDeepLink.value)
  window.location.assign(appUrl)

  if (/^https?:\/\//i.test(appUrl)) {
    return
  }

  document.addEventListener("visibilitychange", handleVisibilityChange, { once: true })
  storeFallbackTimer = setTimeout(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
    if (!document.hidden) {
      window.location.assign(platformStoreUrl.value)
    }
  }, 1600)
}

onBeforeUnmount(() => {
  clearStoreFallback()
  if (import.meta.client) {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  }
})
</script>

<style scoped>
.nearby-app-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 24px calc(18px + env(safe-area-inset-bottom, 0px));
  text-align: center;
}

.nearby-app-prompt__visual {
  position: relative;
  display: grid;
  width: 92px;
  height: 82px;
  place-items: center;
}

.nearby-app-prompt__pulse {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 34%, transparent);
  border-radius: 999px;
}

.nearby-app-prompt__pulse--one {
  width: 82px;
  height: 82px;
  background: color-mix(in srgb, var(--bg-brand) 7%, transparent);
}

.nearby-app-prompt__pulse--two {
  width: 62px;
  height: 62px;
  background: color-mix(in srgb, var(--bg-brand) 9%, transparent);
}

.nearby-app-prompt__brand {
  position: relative;
  z-index: 1;
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  background: var(--bg-surface);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
}

.nearby-app-prompt__logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.nearby-app-prompt__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background: linear-gradient(145deg, #3157f5, #6d4aff);
  color: #fff;
  font-size: 24px;
  font-weight: 850;
}

.nearby-app-prompt__pin {
  position: absolute;
  right: 3px;
  bottom: 1px;
  z-index: 2;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 3px solid var(--bg-surface);
  border-radius: 999px;
  background: var(--bg-brand);
  color: #fff;
}

.nearby-app-prompt__pin :deep(svg) {
  width: 17px;
  height: 17px;
}

.nearby-app-prompt__title {
  max-width: 320px;
  margin-top: 13px;
  color: var(--text-primary);
  font-size: 21px;
  font-weight: 800;
  line-height: 1.3;
}

.nearby-app-prompt__description {
  max-width: 340px;
  margin-top: 9px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.55;
}

.nearby-app-prompt__notice {
  width: 100%;
  margin-top: 13px;
  border-radius: 12px;
  background: #fff7ed;
  padding: 9px 12px;
  color: #9a3412;
  font-size: 12px;
  line-height: 1.45;
}

.nearby-app-prompt__actions {
  display: grid;
  width: 100%;
  gap: 4px;
  margin-top: 19px;
}

.nearby-app-prompt__primary,
.nearby-app-prompt__secondary {
  min-height: 46px;
  justify-content: center;
  border-radius: 12px;
  font-weight: 750;
}

:global(.nearby-app-prompt__content) {
  overflow: hidden;
  border-radius: 22px 22px 0 0;
}
</style>
