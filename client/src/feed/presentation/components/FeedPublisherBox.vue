<template>
  <section class="overflow-hidden rounded-[1.5rem] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(13,38,76,0.05)]">
    <div class="p-4 sm:p-5">
      <div class="flex items-start gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1f34ff_0%,#0000ff_100%)] text-[12px] font-black text-white shadow-[0_8px_18px_rgba(0,0,255,0.18)]">
          VN
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="truncate text-[0.95rem] font-semibold text-[#243b63]">
              {{ t("feed.publisherBox.prompt") }}
            </p>
            <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1 text-[11px] font-semibold">
              {{ audienceLabel }}
            </UBadge>
            <UBadge v-if="draft.text.trim()" color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-semibold">
              {{ t("feed.publisherBox.autosaveLabel") }}
            </UBadge>
          </div>

          <p class="mt-1 text-[0.82rem] text-slate-500">
            {{ expanded ? t("feed.publisherBox.expandedOpen") : t("feed.publisherBox.expandedClosed") }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full"
            :aria-label="t('feed.publisherBox.advancedTrigger')"
            @click="advancedOpen = true"
          >
            <Icon name="i-ph-sliders-horizontal-bold" class="h-4 w-4" />
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full"
            :aria-expanded="expanded"
            :aria-label="expanded ? t('feed.publisherBox.collapseComposer') : t('feed.publisherBox.expandComposer')"
            @click="expanded = !expanded"
          >
            <Icon :name="expanded ? 'i-ph-caret-up-bold' : 'i-ph-caret-down-bold'" class="h-4 w-4" />
          </UButton>
        </div>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="expanded" class="mt-4 space-y-4">
          <UAlert
            v-if="statusAlert"
            class="rounded-[18px]"
            :color="statusAlert.color"
            variant="subtle"
            :icon="statusAlert.icon"
            :title="statusAlert.title"
            :description="statusAlert.description"
            aria-live="polite"
          />

          <UTextarea
            v-model="draft.text"
            autoresize
            :rows="4"
            :maxlength="280"
            :disabled="isBusy"
            :placeholder="t('feed.publisherBox.composerPlaceholder')"
            class="w-full"
            :ui="{
              base: 'min-h-[120px] resize-y rounded-[22px] border border-[#dbe3f2] bg-[#fbfcff] px-4 py-3 text-sm leading-7 text-slate-700 placeholder:text-slate-400',
            }"
          />

          <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-end">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0000ff]/55">
                {{ t("feed.publisherBox.helperLabel") }}
              </p>
              <p class="mt-2 text-[13px] leading-6 text-slate-500">
                {{ helperDescription }}
              </p>
            </div>

            <div class="rounded-[18px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
              <div class="flex items-center justify-between text-[12px] font-semibold text-slate-500">
                <span>{{ t("feed.publisherBox.helperProgress") }}</span>
                <span>{{ t("feed.publisherBox.helper", { count: draft.text.length }) }}</span>
              </div>
              <UProgress :model-value="completionPercent" color="primary" class="mt-3" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <UButton
              v-for="action in actions"
              :key="action.value"
              color="neutral"
              :variant="draft.action === action.value ? 'soft' : 'outline'"
              class="justify-start rounded-full px-4 py-2 text-[12px] font-semibold"
              :disabled="isBusy"
              @click="selectAction(action.value)"
            >
              <Icon :name="action.icon" class="h-4 w-4" />
              {{ action.label }}
            </UButton>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UButton
              v-for="chip in chips"
              :key="chip.value"
              color="neutral"
              :variant="draft.chips.includes(chip.value) ? 'soft' : 'outline'"
              size="xs"
              class="rounded-full px-3 py-2 text-[12px] font-semibold"
              :disabled="isBusy"
              @click="toggleChip(chip.value)"
            >
              <Icon :name="chip.icon" class="h-3.5 w-3.5" />
              {{ chip.label }}
            </UButton>
          </div>

          <div class="flex flex-col gap-3 border-t border-[#e8eef8] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ audienceLabel }}
              </UBadge>
              <UBadge v-if="selectedActionLabel" color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ selectedActionLabel }}
              </UBadge>
              <UBadge v-if="draft.chips.length" color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ t("feed.publisherBox.chipsSelected", { count: draft.chips.length }) }}
              </UBadge>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                color="neutral"
                variant="outline"
                class="rounded-full"
                :disabled="isBusy"
                @click="clearDraft"
              >
                {{ t("feed.publisherBox.clear") }}
              </UButton>
              <UButton
                color="neutral"
                variant="outline"
                class="rounded-full"
                :disabled="isBusy"
                @click="startLive"
              >
                <Icon name="i-ph-broadcast-bold" class="h-4 w-4" />
                {{ t("feed.publisherBox.live") }}
              </UButton>
              <UButton
                color="primary"
                class="rounded-full px-5"
                :loading="isBusy"
                :disabled="isBusy"
                @click="publishPost"
              >
                <Icon name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
                {{ isBusy ? t("feed.publisherBox.submitLoading") : t("feed.publisherBox.share") }}
              </UButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <FeedPublisherComposerPanel
      :open="advancedOpen"
      :audience="draft.audience"
      :selected-action="draft.action"
      :selected-chips="draft.chips"
      @close="advancedOpen = false"
      @reset="resetOptions"
      @update:audience="draft.audience = $event"
      @update:selected-action="draft.action = $event"
      @toggle-chip="toggleChip"
    />
  </section>
</template>

<script setup lang="ts">
import { useStorage } from "@vueuse/core"
import FeedPublisherComposerPanel from "./PublisherComposerPanel.vue"

type PublisherAction = "image" | "video" | "poll" | "gif" | "feeling" | "audio" | "file" | "story" | "product" | ""
type PublisherAudience = "public" | "connections" | "group"
type PublisherChip = "onlyMe" | "location" | "tagFriends" | "colors"
type PublisherStatus = "idle" | "ready" | "loading" | "success" | "error"

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const storageKey = `feed-publisher-draft:${route.path || "/"}`
const draft = useStorage<{
  text: string
  audience: PublisherAudience
  action: PublisherAction
  chips: PublisherChip[]
}>(
  storageKey,
  {
    text: "",
    audience: "public",
    action: "",
    chips: [],
  },
  undefined,
  {
    initOnMounted: true,
    mergeDefaults: true,
  },
)

const expanded = ref(true)
const advancedOpen = ref(false)
const status = ref<PublisherStatus>("ready")

const isBusy = computed(() => status.value === "loading")

const actions = computed(() => [
  { value: "image" as const, label: t("feed.publisherBox.actionImage"), icon: "i-ph-image-bold" },
  { value: "video" as const, label: t("feed.publisherBox.actionVideo"), icon: "i-ph-video-camera-bold" },
  { value: "poll" as const, label: t("feed.publisherBox.actionPoll"), icon: "i-ph-list-checks-bold" },
  { value: "gif" as const, label: t("feed.publisherBox.actionGif"), icon: "i-ph-film-strip-bold" },
  { value: "feeling" as const, label: t("feed.publisherBox.actionFeeling"), icon: "i-ph-smiley-bold" },
  { value: "audio" as const, label: t("feed.publisherBox.actionAudio"), icon: "i-ph-music-notes-bold" },
  { value: "file" as const, label: t("feed.publisherBox.actionFile"), icon: "i-ph-file-text-bold" },
  { value: "story" as const, label: t("feed.publisherBox.actionStory"), icon: "i-ph-sparkle-bold" },
  { value: "product" as const, label: t("feed.publisherBox.actionProduct"), icon: "i-ph-shopping-bag-open-bold" },
])

const chips = computed(() => [
  { value: "onlyMe" as const, label: t("feed.publisherBox.chipOnlyMe"), icon: "i-ph-lock-key-bold" },
  { value: "location" as const, label: t("feed.publisherBox.chipAddLocation"), icon: "i-ph-map-pin-bold" },
  { value: "tagFriends" as const, label: t("feed.publisherBox.chipTagFriends"), icon: "i-ph-user-plus-bold" },
  { value: "colors" as const, label: t("feed.publisherBox.chipColors"), icon: "i-ph-palette-bold" },
])

const audienceLabelMap = computed<Record<PublisherAudience, string>>(() => ({
  public: t("feed.publisherBox.audiencePublic"),
  connections: t("feed.publisherBox.audienceConnections"),
  group: t("feed.publisherBox.audienceGroup"),
}))

const audienceLabel = computed(() => audienceLabelMap.value[draft.value.audience])

const selectedActionLabel = computed(() =>
  actions.value.find(action => action.value === draft.value.action)?.label ?? "",
)

const completionPercent = computed(() => {
  const checks = [
    draft.value.text.trim().length > 0,
    !!draft.value.action,
    draft.value.chips.length > 0,
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

const helperDescription = computed(() => {
  if (selectedActionLabel.value) {
    return t("feed.publisherBox.helperWithAction", { action: selectedActionLabel.value, audience: audienceLabel.value })
  }

  return t("feed.publisherBox.helperDefault", { audience: audienceLabel.value })
})

const statusAlert = computed(() => {
  if (status.value === "idle") return null

  if (status.value === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("feed.publisherBox.statusLoadingTitle"),
      description: t("feed.publisherBox.statusLoadingDescription"),
    }
  }

  if (status.value === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("feed.publisherBox.statusSuccessTitle"),
      description: t("feed.publisherBox.statusSuccessDescription"),
    }
  }

  if (status.value === "error") {
    return {
      color: "warning" as const,
      icon: "i-ph-warning-circle-fill",
      title: t("feed.publisherBox.statusErrorTitle"),
      description: t("feed.publisherBox.statusErrorDescription"),
    }
  }

  return {
    color: "neutral" as const,
    icon: "i-ph-floppy-disk-back-fill",
    title: t("feed.publisherBox.statusReadyTitle"),
    description: t("feed.publisherBox.statusReadyDescription"),
  }
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

watch(
  () => route.path,
  () => {
    expanded.value = true
  },
)

onMounted(() => {
  if (draft.value.text.trim().length) {
    status.value = "ready"
    toast.add({
      color: "primary",
      icon: "i-ph-floppy-disk-back-fill",
      title: t("feed.publisherBox.statusDraftRestoredTitle"),
      description: t("feed.publisherBox.statusDraftRestoredDescription"),
    })
  }
})

function toggleChip(value: PublisherChip) {
  if (draft.value.chips.includes(value)) {
    draft.value.chips = draft.value.chips.filter(item => item !== value)
    return
  }

  draft.value.chips = [...draft.value.chips, value]
}

function selectAction(value: PublisherAction) {
  draft.value.action = draft.value.action === value ? "" : value
}

function resetOptions() {
  draft.value.action = ""
  draft.value.chips = []
  draft.value.audience = "public"
}

function clearDraft() {
  draft.value.text = ""
  resetOptions()
  status.value = "ready"
}

async function publishPost() {
  if (!draft.value.text.trim()) {
    status.value = "error"
    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("feed.publisherBox.statusErrorTitle"),
      description: t("feed.publisherBox.statusErrorDescription"),
    })
    return
  }

  status.value = "loading"
  await sleep(700)
  status.value = "success"

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: t("feed.publisherBox.statusSuccessTitle"),
    description: t("feed.publisherBox.statusSuccessDescription"),
  })

  draft.value.text = ""
  resetOptions()
}

function startLive() {
  status.value = "ready"
  toast.add({
    color: "primary",
    icon: "i-ph-broadcast-fill",
    title: t("feed.publisherBox.live"),
    description: t("feed.publisherBox.liveStarted"),
  })
}
</script>
