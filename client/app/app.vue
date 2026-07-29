<!-- English description: Hosts the root Nuxt app shell, global route loading, error boundary, and toaster. -->
<template>
  <NuxtLoadingIndicator color="var(--bg-brand)" :height="3" :duration="2500" :throttle="0" />
  <AppRouteLogoLoader />

  <component :is="appShellComponent" class="min-h-screen">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtErrorBoundary :key="runtimeBoundaryKey" @error="handleRuntimePageError">
        <NuxtPage :page-key="pageKey" />

        <template #error="{ error: runtimeError, clearError: clearBoundaryError }">
          <div class="px-4 py-6 sm:px-6">
            <div class="overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)]">
              <div class="bg-[linear-gradient(135deg,var(--bg-brand)_0%,var(--bg-brand-hover)_100%)] px-6 py-6 text-[var(--text-inverse)] sm:px-8">
                <p class="text-[10px] font-black uppercase tracking-[0.32em] text-[var(--color-on-brand-secondary)]">
                  {{ $t('appShell.runtimeError.eyebrow') }}
                </p>
                <h1 class="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                  {{ $t('appShell.runtimeError.title') }}
                </h1>
                <p class="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--color-on-brand-secondary)]">
                  {{ $t('appShell.runtimeError.desc') }}
                </p>
              </div>

              <div class="space-y-5 px-6 py-6 sm:px-8">
                <div class="rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-surface-hover)] p-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--text-brand)]">
                    {{ $t('appShell.runtimeError.route') }}
                  </p>
                  <p class="mt-2 break-all text-sm font-semibold text-[var(--text-primary)]">
                    {{ route.fullPath }}
                  </p>

                  <p class="mt-4 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--text-brand)]">
                    {{ $t('appShell.runtimeError.error') }}
                  </p>
                  <p class="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {{ formatRuntimeError(runtimeError) }}
                  </p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    class="justify-center rounded-2xl border border-[var(--border-on-brand)] bg-[var(--bg-brand)] px-6 py-4 font-black uppercase tracking-[0.16em] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] hover:bg-[var(--bg-brand-hover)]"
                    @click="retryCurrentPage(clearBoundaryError)"
                  >
                    {{ $t('appShell.runtimeError.retry') }}
                  </button>
                  <button
                    type="button"
                    class="justify-center rounded-2xl bg-[var(--bg-surface)] px-6 py-4 font-black uppercase tracking-[0.16em] text-[var(--text-primary)] ring-1 ring-[var(--border-light)] hover:ring-[var(--border-strong)]"
                    @click="goToSafePage(clearBoundaryError)"
                  >
                    {{ $t('appShell.runtimeError.safe') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </NuxtErrorBoundary>
    </NuxtLayout>
    <ClientOnly>
      <MessagesMessageCallGlobalHost
        v-if="shouldMountMessageCallHost"
        :poll-incoming="true"
      />
    </ClientOnly>
  </component>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue"
import AppRouteLogoLoader from "../src/shared-kernel/presentation/components/AppRouteLogoLoader.vue"
import { useSiteBrandingHead } from "../src/site-branding/application/composables/useSiteBrandingHead"
import { useSiteBrandingStore } from "../src/site-branding/application/stores/useSiteBrandingStore"

const MessagesMessageCallGlobalHost = defineAsyncComponent(() =>
  import("../src/messages/presentation/components/MessageCallGlobalHost.vue"),
)
const NuxtUiProvider = defineAsyncComponent(() =>
  import("../src/shared-kernel/presentation/components/NuxtUiProvider.vue"),
)

const route = useRoute()
const nuxtApp = useNuxtApp()
const error = useError()
const siteBrandingStore = useSiteBrandingStore()
const backendUserSession = useCookie<string | null>("user_id", {
  default: () => null,
  sameSite: "lax",
  path: "/",
})
const lastSafeRoute = useState("last-safe-route", () => "/home")
const runtimeBoundaryNonce = ref(0)
const shouldMountMessageCallHost = computed(() => Boolean(backendUserSession.value))
const shouldUseNuxtUiProvider = computed(() => route.path !== "/welcome")
const appShellComponent = computed(() => shouldUseNuxtUiProvider.value ? NuxtUiProvider : "div")

await callOnce("site-branding", () => siteBrandingStore.hydrate())
useSiteBrandingHead()

if (import.meta.dev) {
  useHead({
    script: [
      {
        key: "clear-stale-dev-runtime-cache",
        innerHTML: `
(function () {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations()
    .then(function (registrations) {
      return Promise.all(registrations.map(function (registration) {
        return registration.unregister();
      }));
    })
    .catch(function () {});
  if ('caches' in window) {
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) { return caches.delete(key); }));
      })
      .catch(function () {});
  }
})();`,
        tagPosition: "head",
      },
    ],
  })
}

const pageKey = (route: { fullPath?: string, path: string }) => route.fullPath ?? route.path
const runtimeBoundaryKey = computed(() => `${route.fullPath || route.path}::${runtimeBoundaryNonce.value}`)

const rememberSafeRoute = () => {
  if (error.value) return
  lastSafeRoute.value = route.fullPath || route.path || "/home"
}

const handleRuntimePageError = () => {
  if (!error.value) {
    lastSafeRoute.value = route.fullPath || route.path || lastSafeRoute.value || "/home"
  }
}

const resetRuntimeBoundary = async (clearBoundaryError?: () => void | Promise<void>) => {
  if (clearBoundaryError) {
    await clearBoundaryError()
  }

  runtimeBoundaryNonce.value += 1
}

const retryCurrentPage = async (clearBoundaryError?: () => void | Promise<void>) => {
  await resetRuntimeBoundary(clearBoundaryError)
}

const goToSafePage = async (clearBoundaryError?: () => void | Promise<void>) => {
  const fallback = lastSafeRoute.value && lastSafeRoute.value !== route.fullPath
    ? lastSafeRoute.value
    : "/home"

  await resetRuntimeBoundary(clearBoundaryError)
  await navigateTo(fallback)
}

const formatRuntimeError = (runtimeError: unknown) => {
  if (runtimeError instanceof Error) return runtimeError.message
  if (typeof runtimeError === "string") return runtimeError
  if (runtimeError && typeof runtimeError === "object" && "message" in runtimeError) {
    return String((runtimeError as { message?: unknown }).message || "Unknown runtime error")
  }

  return "Unknown runtime error"
}

nuxtApp.hook("page:finish", rememberSafeRoute)

onMounted(() => {
  rememberSafeRoute()
})

watch(() => route.fullPath, () => {
  runtimeBoundaryNonce.value += 1
})
</script>
