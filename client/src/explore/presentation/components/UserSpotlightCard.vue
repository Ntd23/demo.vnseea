<template>
  <article class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,35,110,0.12)]">
    <div class="h-1.5 w-full" :style="{ background: accentBackground }" />

    <div class="space-y-5 px-5 py-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div class="relative">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-[18px] text-[1rem] font-black text-white shadow-[0_14px_28px_rgba(15,35,110,0.18)]"
              :style="{ background: accentBackground }"
            >
              {{ user.initials }}
            </div>

            <span
              v-if="user.online"
              class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-sky-500"
            />
          </div>

          <div class="min-w-0">
            <NuxtLink
              :to="user.href"
              class="block truncate text-[1.1rem] font-black tracking-[-0.03em] text-[#243b63] transition hover:text-[#0000ff]"
            >
              {{ user.name }}
            </NuxtLink>
            <p class="mt-1 text-[13px] font-semibold text-slate-500">
              {{ user.role }}
            </p>
          </div>
        </div>

        <UBadge color="neutral" variant="soft" class="shrink-0 rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-bold text-[#243b63]">
          {{ user.mutualLabel }}
        </UBadge>
      </div>

      <p class="text-[14px] leading-7 text-slate-600">
        {{ user.reason }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2" role="list">
        <div role="listitem" class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            {{ t("pages.explorePage.signalLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ user.meta }}
          </p>
        </div>

        <div role="listitem" class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            {{ t("pages.explorePage.statusLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ profileLabel }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 text-[12px] font-semibold" role="list">
        <span
          v-for="tag in user.tags"
          :key="tag"
          role="listitem"
          class="inline-flex items-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-3 py-1.5 text-[#4b5f82]"
        >
          {{ tag }}
        </span>
      </div>

      <UAlert
        v-if="actionState !== 'idle' && actionMessage"
        class="rounded-[20px]"
        :color="actionState === 'error' ? 'warning' : actionState === 'success' ? 'success' : 'primary'"
        variant="subtle"
        :icon="actionState === 'error'
          ? 'i-ph-warning-circle-fill'
          : actionState === 'success'
            ? 'i-ph-check-circle-fill'
            : 'i-ph-spinner-gap-bold'"
        :description="actionMessage"
      />

      <div class="flex flex-col gap-2 sm:flex-row">
        <UButton
          color="neutral"
          variant="solid"
          size="lg"
          class="justify-center rounded-full text-white shadow-[0_10px_20px_rgba(0,0,255,0.18)]"
          :style="{ background: accentBackground }"
          :loading="actionState === 'loading'"
          :disabled="actionState === 'loading' || connected"
          :aria-label="`${primaryActionLabel}: ${user.name}`"
          @click="connectWithUser"
        >
          {{ primaryActionLabel }}
        </UButton>

        <NuxtLink
          :to="user.href"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0000ff]"
        >
          {{ t("pages.explorePage.viewProfile") }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ExploreUserSpotlight } from "../../domain/types/explore.types"

type SpotlightActionState = "idle" | "loading" | "success" | "error"

const props = defineProps<{
  user: ExploreUserSpotlight
}>()

const { t } = useI18n()
const toast = useToast()
const connected = ref(false)
const actionState = ref<SpotlightActionState>("idle")
const actionMessage = ref("")

const accentBackground = computed(() =>
  `linear-gradient(135deg, ${props.user.accent} 0%, #0000ff 100%)`,
)

const profileLabel = computed(() =>
  props.user.online ? t("pages.explorePage.activeNow") : t("pages.explorePage.connectable"),
)

const primaryActionLabel = computed(() => {
  if (actionState.value === "loading") return t("pages.explorePage.connecting")
  if (connected.value) return t("pages.explorePage.inviteSent")
  return t("pages.explorePage.connectNow")
})

watch(
  () => props.user.id,
  () => {
    connected.value = false
    actionState.value = "idle"
    actionMessage.value = ""
  },
  { immediate: true },
)

async function connectWithUser() {
  if (actionState.value === "loading" || connected.value) return

  if (!props.user.id || !props.user.href) {
    actionState.value = "error"
    actionMessage.value = t("pages.explorePage.connectErrorMessage")

    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: props.user.name,
      description: actionMessage.value,
    })

    return
  }

  actionState.value = "loading"
  actionMessage.value = ""

  await new Promise(resolve => setTimeout(resolve, 260))

  connected.value = true
  actionState.value = "success"
  actionMessage.value = t("pages.explorePage.connectSuccessMessage", {
    name: props.user.name,
  })

  toast.add({
    color: "success",
    icon: "i-ph-user-plus-fill",
    title: props.user.name,
    description: actionMessage.value,
  })
}
</script>
