<!-- English description: Presents a mobile-only native-app handoff for story creation with a web fallback. -->
<template>
  <UDrawer
    v-model:open="open"
    :title="t('feed.storyCarousel.appPromptTitle')"
    :description="t('feed.storyCarousel.appPromptDescription')"
    :ui="{
      content: 'story-app-prompt__content',
      header: 'hidden',
      body: 'p-0 sm:p-0',
    }"
  >
    <template #body>
      <div class="story-app-prompt">
        <div class="story-app-prompt__brand">
          <img
            v-if="displayLogoUrl && !logoFailed"
            :src="displayLogoUrl"
            :alt="logoAlt"
            class="story-app-prompt__logo"
            @error="logoFailed = true"
          >
          <span v-else class="story-app-prompt__fallback" aria-hidden="true">
            {{ brandInitial }}
          </span>
        </div>

        <h2 class="story-app-prompt__title">
          {{ t("feed.storyCarousel.appPromptTitle") }}
        </h2>
        <p class="story-app-prompt__description">
          {{ t("feed.storyCarousel.appPromptDescription") }}
        </p>

        <p v-if="configurationMissing" class="story-app-prompt__notice" role="status">
          {{ t("feed.storyCarousel.appPromptNotConfigured") }}
        </p>

        <div class="story-app-prompt__actions">
          <UButton
            type="button"
            size="lg"
            block
            class="story-app-prompt__primary"
            :disabled="!canOpenApp"
            @click="openNativeApp"
          >
            {{ t("feed.storyCarousel.openApp") }}
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useSiteBrandingStore } from "../../../site-branding/application/stores/useSiteBrandingStore"

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const logoFailed = ref(false)

type NativeAppRuntimeConfig = {
  storyDeepLink?: string
  iosStoreUrl?: string
  androidStoreUrl?: string
}

const publicRuntimeConfig = runtimeConfig.public as typeof runtimeConfig.public & {
  nativeApp?: NativeAppRuntimeConfig
}
const nativeAppConfig = computed(() => publicRuntimeConfig.nativeApp)

const brandName = computed(() => branding.value.siteName || branding.value.siteTitle || "VNSEEA")
const rawLogoUrl = computed(() => branding.value.faviconUrl || branding.value.logoUrl)
const displayLogoUrl = computed(() => {
  const source = rawLogoUrl.value.trim()

  if (!source || /^https?:\/\//i.test(source)) {
    return source
  }

  const backendBase = String(runtimeConfig.public.backendWebBase || runtimeConfig.public.siteUrl || "").replace(/\/+$/, "")
  return backendBase && (source.startsWith("/themes/") || source.startsWith("/upload/"))
    ? `${backendBase}${source}`
    : source
})
const logoAlt = computed(() => `${brandName.value} logo`)
const brandInitial = computed(() => brandName.value.trim().charAt(0).toUpperCase() || "V")

const storyDeepLink = computed(() => String(nativeAppConfig.value?.storyDeepLink || "").trim())
const iosStoreUrl = computed(() => String(nativeAppConfig.value?.iosStoreUrl || "").trim())
const androidStoreUrl = computed(() => String(nativeAppConfig.value?.androidStoreUrl || "").trim())

type MobileStorePlatform = "ios" | "android"

const mobilePlatform = computed<MobileStorePlatform>(() => {
  if (!import.meta.client) {
    return "android"
  }

  const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  return isIos ? "ios" : "android"
})

const platformStoreUrl = computed(() => {
  return mobilePlatform.value === "ios" ? iosStoreUrl.value : androidStoreUrl.value
})

// A store URL is mandatory because it is the safe fallback when the OS cannot open the app.
const canOpenApp = computed(() => Boolean(platformStoreUrl.value))
const configurationMissing = computed(() => !canOpenApp.value)

watch(displayLogoUrl, () => {
  logoFailed.value = false
})

let storeFallbackTimer: ReturnType<typeof setTimeout> | undefined

function clearStoreFallback() {
  if (storeFallbackTimer) {
    clearTimeout(storeFallbackTimer)
    storeFallbackTimer = undefined
  }
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

function openNativeApp() {
  if (!import.meta.client || !canOpenApp.value) {
    return
  }

  open.value = false
  clearStoreFallback()

  if (!storyDeepLink.value) {
    window.location.assign(platformStoreUrl.value)
    return
  }

  const appUrl = buildAppHandoffUrl(storyDeepLink.value)
  window.location.assign(appUrl)

  // HTTP(S) universal links fall back to the web route when the app is absent.
  // That route handles the store redirect from the native_app_fallback query.
  if (/^https?:\/\//i.test(appUrl)) {
    return
  }

  if (platformStoreUrl.value) {
    document.addEventListener("visibilitychange", handleVisibilityChange, { once: true })
    storeFallbackTimer = setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (!document.hidden) {
        window.location.assign(platformStoreUrl.value)
      }
    }, 1600)
  }
}

onBeforeUnmount(() => {
  clearStoreFallback()
  if (import.meta.client) {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  }
})
</script>

<style scoped>
.story-app-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 24px calc(20px + env(safe-area-inset-bottom, 0px));
  text-align: center;
}

.story-app-prompt__brand {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  overflow: hidden;
  margin-top: 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
}

.story-app-prompt__logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
}

.story-app-prompt__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background: linear-gradient(145deg, #3157f5, #6d4aff);
  color: #ffffff;
  font-size: 28px;
  font-weight: 850;
}

.story-app-prompt__title {
  max-width: 300px;
  margin-top: 18px;
  color: var(--text-primary, #111827);
  font-size: 21px;
  font-weight: 800;
  line-height: 1.3;
}

.story-app-prompt__description {
  max-width: 330px;
  margin-top: 10px;
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  line-height: 1.55;
}

.story-app-prompt__notice {
  width: 100%;
  margin-top: 14px;
  border-radius: 12px;
  background: #fff7ed;
  padding: 9px 12px;
  color: #9a3412;
  font-size: 12px;
  line-height: 1.45;
}

.story-app-prompt__actions {
  display: grid;
  width: 100%;
  gap: 4px;
  margin-top: 20px;
}

.story-app-prompt__primary {
  min-height: 46px;
  justify-content: center;
  border-radius: 12px;
  font-weight: 750;
}

:global(.story-app-prompt__content) {
  overflow: hidden;
  border-radius: 22px 22px 0 0;
}

@media (min-width: 640px) {
  .story-app-prompt {
    padding-inline: 32px;
  }
}
</style>
