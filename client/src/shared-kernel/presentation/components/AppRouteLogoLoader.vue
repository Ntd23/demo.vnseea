<!-- English description: Displays the site logo during initial hydration and global Nuxt route loading. -->
<template>
  <Transition name="app-route-loader">
    <div
      v-if="isVisible"
      class="app-route-logo-loader"
      aria-hidden="true"
    >
      <div class="app-route-logo-loader__mark">
        <img
          v-if="displayLogoUrl && !logoFailed"
          :src="displayLogoUrl"
          alt=""
          class="app-route-logo-loader__image"
          decoding="async"
          fetchpriority="high"
          loading="eager"
          @error="logoFailed = true"
        >
        <span v-else class="app-route-logo-loader__fallback">
          {{ brandInitial }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useSiteBrandingStore } from "../../../site-branding/application/stores/useSiteBrandingStore"

const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const { isLoading } = useLoadingIndicator()
const initialLoading = ref(true)
const logoFailed = ref(false)
let initialFrameId: number | undefined

const brandName = computed(() =>
  branding.value.siteName || branding.value.siteTitle || "VNSEEA",
)
const displayLogoUrl = computed(() =>
  branding.value.faviconUrl || branding.value.logoUrl,
)
const brandInitial = computed(() =>
  brandName.value.trim().charAt(0).toUpperCase() || "V",
)
const isVisible = computed(() => initialLoading.value || isLoading.value)

watch(displayLogoUrl, () => {
  logoFailed.value = false
})

onMounted(() => {
  initialFrameId = window.requestAnimationFrame(() => {
    initialLoading.value = false
  })
})

onBeforeUnmount(() => {
  if (initialFrameId !== undefined) {
    window.cancelAnimationFrame(initialFrameId)
  }
})
</script>

<style scoped>
.app-route-logo-loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--bg-base) 82%, transparent);
  backdrop-filter: blur(2px);
  cursor: progress;
}

.app-route-logo-loader__mark {
  position: relative;
  display: grid;
  width: 60px;
  height: 60px;
  place-items: center;
}

.app-route-logo-loader__image,
.app-route-logo-loader__fallback {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-lg);
  animation: app-route-logo-reveal 0.9s var(--ease-default) infinite alternate;
}

.app-route-logo-loader__image {
  object-fit: contain;
  filter: drop-shadow(0 5px 12px color-mix(in srgb, var(--text-primary) 12%, transparent));
}

.app-route-logo-loader__fallback {
  display: grid;
  place-items: center;
  background: var(--bg-brand);
  color: var(--text-inverse);
  font-size: 24px;
  font-weight: var(--weight-bold);
}

.app-route-loader-enter-active,
.app-route-loader-leave-active {
  transition: opacity var(--duration-fast) var(--ease-default);
}

.app-route-loader-enter-from,
.app-route-loader-leave-to {
  opacity: 0;
}

@keyframes app-route-logo-reveal {
  from {
    opacity: 0.28;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-route-logo-loader__image,
  .app-route-logo-loader__fallback {
    animation: none;
  }
}
</style>
