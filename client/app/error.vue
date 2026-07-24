<!-- English description: Renders the global Nuxt error recovery screen. -->
<template>
  <UApp>
    <div class="min-h-screen bg-[var(--bg-base)] px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto flex min-h-[calc(100dvh-80px)] max-w-3xl items-center justify-center">
        <section class="surface-card w-full overflow-hidden border border-[var(--border-light)] shadow-[var(--shadow-xl)]">
          <div class="bg-[linear-gradient(135deg,var(--bg-brand)_0%,var(--bg-brand-hover)_58%,var(--bg-media)_100%)] px-8 py-10 text-[var(--text-media)] sm:px-10">
            <p class="text-[11px] font-black uppercase tracking-[0.32em] text-[var(--text-media-muted)]">
              {{ $t('errorScreen.eyebrow') }}
            </p>
            <h1 class="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {{ statusTitle }}
            </h1>
            <p class="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[var(--text-media-muted)]">
              {{ statusDescription }}
            </p>
          </div>

          <div class="space-y-6 px-8 py-8 sm:px-10 sm:py-10">
            <div class="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-muted)] p-5">
              <div class="flex flex-wrap items-center gap-3">
                <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                  {{ error.statusCode || 500 }}
                </UBadge>
                <span class="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {{ route.fullPath }}
                </span>
              </div>
              <p class="mt-4 text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
                {{ errorMessage }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <UButton
                size="xl"
                class="justify-center rounded-2xl bg-[var(--bg-brand)] px-6 font-black uppercase tracking-[0.18em] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] hover:bg-[var(--bg-brand-hover)]"
                @click="recoverToLastSafeRoute"
              >
                {{ $t('errorScreen.back') }}
              </UButton>
              <UButton
                size="xl"
                color="neutral"
                variant="soft"
                class="justify-center rounded-2xl px-6 font-black uppercase tracking-[0.18em] text-[var(--text-primary)] ring-1 ring-[var(--border-light)] hover:ring-[var(--border-strong)]"
                @click="recoverToHome"
              >
                {{ $t('errorScreen.home') }}
              </UButton>
            </div>

            <p class="text-xs font-semibold text-[var(--text-tertiary)]">
              {{ $t('errorScreen.autoRecoverHint') }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const route = useRoute()
const lastSafeRoute = useState("last-safe-route", () => "/home")

const statusCode = computed(() => props.error.statusCode || 500)

const statusTitle = computed(() => {
  if (statusCode.value === 404) return t("errorScreen.statusNotFound")
  if (statusCode.value >= 500) return t("errorScreen.statusServerError")
  return t("errorScreen.statusFallback")
})

const statusDescription = computed(() => {
  if (statusCode.value === 404) {
    return t("errorScreen.descNotFound")
  }

  if (statusCode.value >= 500) {
    return t("errorScreen.descServerError")
  }

  return t("errorScreen.descFallback")
})

const errorMessage = computed(() => props.error.message || t("errorScreen.errorMessageFallback"))

const recoveryTarget = computed(() => {
  const fallback = lastSafeRoute.value || "/home"
  if (fallback && fallback !== route.fullPath) return fallback
  if (route.fullPath !== "/home") return "/home"
  return "/"
})

const canAutoRecover = computed(() => recoveryTarget.value !== route.fullPath)

const recoverToLastSafeRoute = async () => {
  await clearError({ redirect: recoveryTarget.value })
}

const recoverToHome = async () => {
  await clearError({ redirect: "/home" })
}

let recoveryTimer: ReturnType<typeof window.setTimeout> | null = null

onMounted(() => {
  if (!canAutoRecover.value) return

  recoveryTimer = window.setTimeout(() => {
    void recoverToLastSafeRoute()
  }, 180)
})

onBeforeUnmount(() => {
  if (recoveryTimer) window.clearTimeout(recoveryTimer)
})
</script>
