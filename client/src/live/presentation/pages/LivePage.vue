<!-- English description: Renders the backend-backed LiveKit host studio for the /live route with real setup, preview, heartbeat, and end-live controls. -->
<template>
  <div class="studio">
    <div class="studio__shell studio__shell--2col">

      <!-- ── LEFT SIDEBAR: Setup ───────────────────────── -->
      <aside class="studio__sidebar">
        <template v-if="bootstrapLoading">
          <div class="studio__skeleton-stack">
            <USkeleton class="h-16 w-full rounded-2xl" />
            <USkeleton class="h-10 w-3/4 rounded-xl" />
            <USkeleton class="h-10 w-full rounded-2xl" />
            <USkeleton class="h-10 w-full rounded-2xl" />
            <USkeleton class="h-24 w-full rounded-2xl" />
            <USkeleton class="h-12 w-full rounded-2xl" />
          </div>
        </template>

        <template v-else>
          <!-- Alerts -->
          <div v-if="bootstrapErrorMessage || blockedReasonMessage || errorMessage || statusMessage" class="studio__alerts">
            <UAlert v-if="bootstrapErrorMessage" color="error" variant="soft" :title="t('pages.livePage.studio.bootstrapErrorTitle')" :description="bootstrapErrorMessage" class="rounded-2xl" />
            <UAlert v-else-if="blockedReasonMessage" color="warning" variant="soft" :title="t('pages.livePage.studio.blockedTitle')" :description="blockedReasonMessage" class="rounded-2xl" />
            <UAlert v-if="errorMessage" color="error" variant="soft" :title="t('pages.livePage.studio.errorTitle')" :description="errorMessage" class="rounded-2xl" />
            <UAlert v-if="statusMessage" :color="liveState === 'offline' ? 'neutral' : 'primary'" variant="soft" :title="t('pages.livePage.studio.statusTitle')" :description="statusMessage" class="rounded-2xl" />
          </div>

          <!-- Host info -->
          <div class="studio__host">
            <UAvatar
              :src="bootstrap.host?.avatarUrl || undefined"
              :alt="bootstrap.host?.name || t('pages.livePage.studio.hostFallback')"
              size="lg"
              class="shrink-0"
              :ui="{ rounded: 'rounded-2xl' }"
            />
            <div class="min-w-0">
              <p class="studio__host-name">{{ bootstrap.host?.name || t("pages.livePage.studio.hostFallback") }}</p>
              <p class="studio__host-role">{{ bootstrap.host?.note || t("pages.livePage.studio.hostRoleFallback") }}</p>
            </div>
          </div>

          <!-- Setup fields -->
          <div class="studio__fields">
            <div class="studio__field">
              <label class="studio__label">{{ t("pages.livePage.studio.destinationLabel") }}</label>
              <div class="studio__select-wrap">
                <USelect
                  :model-value="bootstrap.destination"
                  :items="destinationSelectOptions"
                  value-key="value"
                  label-key="label"
                  disabled
                  color="primary"
                  size="xl"
                  class="w-full"
                  :ui="{ base: 'rounded-2xl bg-white border-slate-200' }"
                />
                <select v-if="false" :value="bootstrap.destination" disabled class="studio__select">
                  <option v-for="opt in bootstrap.destinationOptions" :key="opt.value" :value="opt.value">
                    {{ opt.value === "timeline" ? t("pages.livePage.studio.destinationTimeline") : opt.label }}
                  </option>
                </select>
                <UIcon v-if="false" name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__field">
              <label class="studio__label">{{ t("pages.livePage.studio.privacyLabel") }}</label>
              <div class="studio__select-wrap">
                <USelect
                  v-model="privacy"
                  :items="privacySelectOptions"
                  value-key="value"
                  label-key="label"
                  :disabled="Boolean(session)"
                  color="primary"
                  size="xl"
                  class="w-full"
                  :ui="{ base: 'rounded-2xl bg-white border-slate-200' }"
                />
                <select v-if="false" v-model="privacy" class="studio__select" :disabled="Boolean(session)">
                  <option v-for="opt in bootstrap.privacyOptions" :key="opt.value" :value="opt.value">
                    {{ privacyLabel(opt.value) }}
                  </option>
                </select>
                <UIcon v-if="false" name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__field">
              <label class="studio__label">{{ t("pages.livePage.studio.titleLabel") }}</label>
              <UInput
                v-model="title"
                :placeholder="t('pages.livePage.studio.titlePlaceholder')"
                :disabled="Boolean(session)"
                :ui="{ base: 'rounded-2xl bg-white border-slate-200 focus:border-blue-500' }"
              />
            </div>

            <div class="studio__field">
              <label class="studio__label">{{ t("pages.livePage.studio.descriptionLabel") }}</label>
              <UTextarea
                v-model="description"
                :rows="3"
                :placeholder="t('pages.livePage.studio.descriptionPlaceholder')"
                :disabled="Boolean(session)"
                :ui="{ base: 'rounded-2xl bg-white border-slate-200 focus:border-blue-500' }"
              />
            </div>

            <div class="studio__field">
              <label class="studio__label">{{ t("pages.livePage.studio.thumbnailLabel") }}</label>
              <label class="studio__file-btn">
                <UIcon name="i-ph-image-duotone" class="h-4 w-4 text-slate-500" />
                <span>{{ thumbnailFile ? thumbnailFile.name : t("pages.livePage.studio.thumbnailButton") }}</span>
                <input type="file" accept="image/*" class="sr-only" @change="handleThumbnailChange">
              </label>
            </div>
          </div>

          <!-- Device controls -->
          <div class="studio__device-section">
            <p class="studio__section-label">{{ t("pages.livePage.studio.devicesLabel") }}</p>
            <div class="studio__field">
              <label class="studio__label">{{ t("pages.livePage.studio.cameraLabel") }}</label>
              <div class="studio__select-wrap">
                <select
                  v-model="selectedCameraId"
                  class="studio__select"
                  :disabled="roomConnected || previewLoading || cameraOptions.length === 0"
                  @change="handleCameraChange"
                >
                  <option v-for="opt in cameraOptions" :key="opt.deviceId" :value="opt.deviceId">
                    {{ opt.label }}
                  </option>
                </select>
                <UIcon v-if="false" name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__field">
              <label class="studio__label">{{ t("pages.livePage.studio.microphoneLabel") }}</label>
              <div class="studio__select-wrap">
                <select
                  v-model="selectedMicrophoneId"
                  class="studio__select"
                  :disabled="roomConnected || previewLoading || microphoneOptions.length === 0"
                  @change="handleMicrophoneChange"
                >
                  <option v-for="opt in microphoneOptions" :key="opt.deviceId" :value="opt.deviceId">
                    {{ opt.label }}
                  </option>
                </select>
                <UIcon v-if="false" name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__media-toggles">
              <UButton
                :icon="videoMuted ? 'i-ph-video-camera-slash-bold' : 'i-ph-video-camera-bold'"
                :label="videoMuted ? t('pages.livePage.studio.enableCamera') : t('pages.livePage.studio.disableCamera')"
                :color="videoMuted ? 'error' : 'neutral'"
                :variant="videoMuted ? 'soft' : 'outline'"
                size="md"
                class="studio__toggle-btn"
                @click="toggleVideo"
              />
              <template v-if="false">
                <UIcon :name="videoMuted ? 'i-ph-video-camera-slash-bold' : 'i-ph-video-camera-bold'" class="h-4 w-4" />
                <span>{{ videoMuted ? t("pages.livePage.studio.enableCamera") : t("pages.livePage.studio.disableCamera") }}</span>
              </template>
              <UButton
                :icon="audioMuted ? 'i-ph-microphone-slash-bold' : 'i-ph-microphone-bold'"
                :label="audioMuted ? t('pages.livePage.studio.enableMicrophone') : t('pages.livePage.studio.disableMicrophone')"
                :color="audioMuted ? 'error' : 'neutral'"
                :variant="audioMuted ? 'soft' : 'outline'"
                size="md"
                class="studio__toggle-btn"
                @click="toggleAudio"
              />
              <template v-if="false">
                <UIcon :name="audioMuted ? 'i-ph-microphone-slash-bold' : 'i-ph-microphone-bold'" class="h-4 w-4" />
                <span>{{ audioMuted ? t("pages.livePage.studio.enableMicrophone") : t("pages.livePage.studio.disableMicrophone") }}</span>
              </template>
            </div>
          </div>

          <!-- Action button -->
          <div class="studio__sidebar-action">
            <UButton
              v-if="!session"
              size="xl"
              color="primary"
              class="w-full justify-center rounded-2xl font-bold"
              :loading="starting"
              :disabled="!canStart || previewLoading || !mediaSupported"
              @click="handleStartLive"
            >
              <template #leading>
                <UIcon name="i-ph-broadcast-bold" class="h-5 w-5" />
              </template>
              {{ t("pages.livePage.studio.startBroadcast") }}
            </UButton>
            <UButton
              v-else
              size="xl"
              color="error"
              class="w-full justify-center rounded-2xl font-bold"
              :loading="ending"
              @click="handleEndLive"
            >
              <template #leading>
                <UIcon name="i-ph-stop-circle-bold" class="h-5 w-5" />
              </template>
              {{ t("pages.livePage.studio.endBroadcast") }}
            </UButton>
          </div>
        </template>
      </aside>

      <!-- ── CENTER: Stage ────────────────────────────── -->
      <main class="studio__main">

        <!-- Video stage -->
        <div class="studio__stage-card">

          <!-- Video frame + fullscreen overlay -->
          <div ref="previewStageHost" class="studio__stage">
            <div v-if="showStagePlaceholder" class="studio__stage-placeholder">
              <div class="studio__stage-icon-wrap">
                <UIcon name="i-ph-video-camera-duotone" class="h-10 w-10 text-slate-300" />
              </div>
              <p class="studio__stage-placeholder-title">{{ stageTitle }}</p>
              <p class="studio__stage-placeholder-desc">{{ stageDescription }}</p>
            </div>
            <!-- Fullscreen icon (overlay, inside video) -->
            <UButton
              :icon="isFullscreen ? 'i-ph-arrows-in-bold' : 'i-ph-arrows-out-bold'"
              :aria-label="isFullscreen ? t('pages.livePage.viewer.exitFullscreen') : t('pages.livePage.viewer.openFullscreen')"
              color="neutral"
              variant="solid"
              size="lg"
              square
              class="studio__fullscreen-btn"
              :ui="{ base: 'absolute right-3.5 top-3.5 z-[80] rounded-full bg-black/60 text-white shadow-lg ring-1 ring-white/20 hover:bg-black/75' }"
              @click="toggleFullscreen"
            />
            <template v-if="false">
              <UIcon :name="isFullscreen ? 'i-ph-arrows-in-bold' : 'i-ph-arrows-out-bold'" class="h-5 w-5" />
            </template>

            <div v-if="isFullscreen && session" class="studio__fs-overlay">
              <div class="studio__fs-topbar">
                <div class="studio__fs-host">
                  <UAvatar
                    :src="bootstrap.host?.avatarUrl || undefined"
                    :alt="bootstrap.host?.name || t('pages.livePage.studio.hostFallback')"
                    size="lg"
                  />
                  <div class="min-w-0">
                    <p class="studio__fs-name">{{ bootstrap.host?.name || t("pages.livePage.studio.hostFallback") }}</p>
                    <div class="studio__fs-meta">
                      <UBadge color="error" variant="solid" class="rounded-full px-3 py-1 text-[10px] font-bold">{{ t("pages.livePage.statusLiveUpper") }}</UBadge>
                      <span><UIcon name="i-ph-eye-duotone" /> {{ viewerCount }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="studio__fs-comments">
                <div v-if="fullscreenComments.length === 0" class="studio__fs-empty">
                  {{ t("pages.livePage.studio.noNewComments") }}
                </div>
                <article
                  v-for="item in fullscreenComments"
                  :key="`${item.kind}-${item.id}-${item.username}-${item.timeText}`"
                  class="studio__fs-comment"
                >
                  <UAvatar :src="item.avatarUrl || undefined" :alt="item.author" size="sm" />
                  <div class="studio__fs-comment-body">
                    <strong>{{ item.author }}</strong>
                    <span>{{ item.message }}</span>
                  </div>
                </article>
              </div>

              <div class="studio__fs-hearts">
                <img
                  v-for="reaction in floatingReactions"
                  :key="reaction.id"
                  :src="reaction.src"
                  alt=""
                  class="studio__fs-heart"
                  :style="{ left: `${reaction.x}%` }"
                  draggable="false"
                >
              </div>
            </div>

            <div v-if="session && !isFullscreen" class="studio__stage-activity-overlay">
              <div class="studio__stage-comments">
                <div v-if="fullscreenComments.length === 0" class="studio__stage-empty">
                  {{ t("pages.livePage.studio.noNewComments") }}
                </div>
                <article
                  v-for="item in fullscreenComments"
                  :key="`stage-video-${item.kind}-${item.id}-${item.username}-${item.timeText}`"
                  class="studio__stage-comment"
                >
                  <UAvatar :src="item.avatarUrl || undefined" :alt="item.author" size="xs" />
                  <div class="studio__stage-comment-body">
                    <strong>{{ item.author }}</strong>
                    <span>{{ item.message }}</span>
                  </div>
                </article>
              </div>

            </div>

            <div v-if="session && !isFullscreen" class="studio__stage-hearts">
              <img
                v-for="reaction in floatingReactions"
                :key="reaction.id"
                :src="reaction.src"
                alt=""
                class="studio__stage-heart"
                :style="{ left: `${reaction.x}%` }"
                draggable="false"
              >
            </div>
          </div>

          <div v-if="session && !isFullscreen" class="studio__activity-panel">
            <div class="studio__activity-head">
              <div>
                <p class="studio__activity-eyebrow">{{ t("pages.livePage.studio.activityEyebrow") }}</p>
                <h2 class="studio__activity-title">{{ t("pages.livePage.studio.activityTitle") }}</h2>
              </div>
              <div class="studio__activity-stats">
                <span><UIcon name="i-ph-heart-fill" /> {{ reactionsCount }}</span>
                <span><UIcon name="i-ph-share-fat-fill" /> {{ sharesCount }}</span>
              </div>
            </div>

            <div class="studio__activity-list">
              <div v-if="fullscreenComments.length === 0" class="studio__activity-empty">
                {{ t("pages.livePage.studio.noNewComments") }}
              </div>
              <article
                v-for="item in fullscreenComments"
                :key="`stage-${item.kind}-${item.id}-${item.username}-${item.timeText}`"
                class="studio__activity-comment"
              >
                <UAvatar :src="item.avatarUrl || undefined" :alt="item.author" size="sm" />
                <div class="studio__activity-comment-body">
                  <strong>{{ item.author }}</strong>
                  <span>{{ item.message }}</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { feedReactionAssets } from "../../../feed/application/constants/reaction-assets"
import { useLiveKitStudio } from "../../application/composables/useLiveKitStudio"
import { useLiveStudioPageVM } from "../../application/view-models/useLiveStudioPageVM"

const { t } = useI18n()
useSeoMeta({
  title: () => t("pages.livePage.seoTitle"),
  description: () => t("pages.livePage.seoDescription"),
})

const previewStageHost = ref<HTMLElement | null>(null)

const {
  bootstrap, bootstrapLoading, bootstrapErrorMessage, blockedReasonMessage,
  title, description, privacy, thumbnailFile, session, liveState, viewerCount,
  reactionsCount, sharesCount, activityItems, reactionEvents,
  canStart, starting, ending, statusMessage, errorMessage,
  setThumbnail, startLive, endLive, refreshBootstrap,
} = useLiveStudioPageVM()

const {
  mediaSupported, previewLoading, previewReady, previewError,
  cameraOptions, microphoneOptions, selectedCameraId, selectedMicrophoneId,
  roomConnected, audioMuted, videoMuted,
  ensurePreview, setCamera, setMicrophone, toggleAudio, toggleVideo,
  connect, disconnect, setPreviewHost,
} = useLiveKitStudio()

watch(previewStageHost, (el) => setPreviewHost(el), { flush: "post", immediate: true })

watch(
  () => bootstrap.value.canUseLive,
  async (canUseLive) => {
    if (!canUseLive || session.value) return
    if (!previewReady.value && !previewLoading.value) await ensurePreview()
  },
  { immediate: true },
)

watch(
  () => liveState.value,
  (state) => { if (state === "offline" && roomConnected.value) disconnect() },
)

const privacyLabel = (v: string) => {
  if (v === "1") return t("pages.livePage.studio.privacyFriends")
  if (v === "2") return t("pages.livePage.studio.privacyFollowers")
  if (v === "3") return t("pages.livePage.studio.privacyOnlyMe")
  return t("pages.livePage.studio.privacyPublic")
}

const destinationSelectOptions = computed(() =>
  bootstrap.value.destinationOptions.map(option => ({
    label: option.value === "timeline" ? t("pages.livePage.studio.destinationTimeline") : option.label,
    value: option.value,
  })),
)

const privacySelectOptions = computed(() =>
  bootstrap.value.privacyOptions.map(option => ({
    label: privacyLabel(option.value),
    value: option.value,
  })),
)

const liveStateLabel = computed(() => {
  if (liveState.value === "live") return t("pages.livePage.studio.liveStateLive")
  if (liveState.value === "stale") return t("pages.livePage.studio.liveStateStale")
  return t("pages.livePage.studio.liveStateOffline")
})

const liveStateBadgeColor = computed(() => {
  if (liveState.value === "live") return "success"
  if (liveState.value === "stale") return "warning"
  return "neutral"
})

const showStagePlaceholder = computed(() =>
  previewLoading.value || !previewReady.value || Boolean(previewError.value) || videoMuted.value,
)

const stageTitle = computed(() => {
  if (!mediaSupported.value) return t("pages.livePage.studio.stageUnsupported")
  if (previewLoading.value) return t("pages.livePage.studio.stageStartingCamera")
  if (previewError.value) return t("pages.livePage.studio.stageCameraError")
  if (videoMuted.value) return t("pages.livePage.studio.stageCameraOff")
  if (session.value) return t("pages.livePage.studio.stagePreviewReady")
  return t("pages.livePage.studio.stageConnectCamera")
})

const stageDescription = computed(() => {
  if (previewError.value) return previewError.value
  if (!mediaSupported.value) return t("pages.livePage.studio.stageUnsupportedDescription")
  if (previewLoading.value) return t("pages.livePage.studio.stageStartingCameraDescription")
  if (videoMuted.value) return t("pages.livePage.studio.stageCameraOffDescription")
  if (session.value) return t("pages.livePage.studio.stagePublishingDescription")
  return t("pages.livePage.studio.stageConnectCameraDescription")
})

async function handleStartLive() {
  if (!mediaSupported.value) return
  await ensurePreview()
  if (previewError.value) return
  await startLive(async (s) => { await connect(s) })
}

async function handleEndLive() {
  await endLive(() => { disconnect() })
}

async function handleCameraChange(e: Event) {
  await setCamera((e.target as HTMLSelectElement).value)
}

async function handleMicrophoneChange(e: Event) {
  await setMicrophone((e.target as HTMLSelectElement).value)
}

function handleThumbnailChange(e: Event) {
  const input = e.target as HTMLInputElement
  setThumbnail(input.files?.[0] ?? null)
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen()
  } else {
    const el = previewStageHost.value
    if (el && typeof el.requestFullscreen === "function") void el.requestFullscreen()
  }
}

const isFullscreen = ref(false)
const floatingReactions = ref<Array<{ id: number; src: string; x: number }>>([])
const animatedReactionIds = new Set<number>()

const fullscreenComments = computed(() =>
  activityItems.value.filter(item => item.kind === "comment").slice(-6),
)

function reactionAssetSrc(value: string) {
  return feedReactionAssets.find(asset =>
    asset.value === value || String(asset.backendId) === value,
  )?.src ?? feedReactionAssets[0]?.src ?? ""
}

function pushFloatingReaction(src: string, seed: number) {
  if (!src) {
    return
  }

  const reaction = {
    id: Date.now() + seed,
    src,
    x: 12 + Math.random() * 72,
  }

  floatingReactions.value = [...floatingReactions.value.slice(-8), reaction]
  window.setTimeout(() => {
    floatingReactions.value = floatingReactions.value.filter(item => item.id !== reaction.id)
  }, 2600)
}

watch(reactionEvents, (nextEvents) => {
  if (!import.meta.client || !session.value) {
    return
  }

  nextEvents.forEach((event) => {
    if (event.id > 0 && animatedReactionIds.has(event.id)) {
      return
    }

    if (event.id > 0) {
      animatedReactionIds.add(event.id)
    }

    pushFloatingReaction(reactionAssetSrc(event.value), event.id)
  })
})

watch(reactionsCount, (nextValue, previousValue = 0) => {
  if (!import.meta.client || !session.value || nextValue <= previousValue || reactionEvents.value.length > 0) {
    return
  }

  const asset = feedReactionAssets[(nextValue + previousValue) % feedReactionAssets.length]
  pushFloatingReaction(asset.src, nextValue)
})

watch(session, (nextSession) => {
  if (nextSession) {
    return
  }

  animatedReactionIds.clear()
  floatingReactions.value = []
})

onMounted(() => {
  document.addEventListener("fullscreenchange", () => {
    isFullscreen.value = Boolean(document.fullscreenElement)
  })
})
</script>

<style scoped>
/* ── Page shell ───────────────────────────────────────── */
.studio {
  min-height: 100vh;
  background: #f1f5f9;
  padding: 24px 16px 48px;
}

.studio__shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
}

.studio__shell--2col {
  grid-template-columns: 320px minmax(0, 1fr);
}

/* ── Sidebar ──────────────────────────────────────────── */
.studio__sidebar {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 84px;
}

.studio__skeleton-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.studio__alerts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.studio__host {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: #f8fafc;
}

.studio__host-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.studio__host-role {
  font-size: 12px;
  color: #64748b;
  margin: 3px 0 0;
}

.studio__fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.studio__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.studio__field--inline {
  flex: 1;
}

.studio__label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.02em;
}

/* Selects */
.studio__select-wrap {
  position: relative;
}

.studio__select {
  width: 100%;
  height: 44px;
  padding: 0 36px 0 14px;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 500;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.studio__select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
}

.studio__select:disabled {
  opacity: 0.6;
  cursor: default;
  background: #f8fafc;
}

.studio__select--sm {
  height: 40px;
  font-size: 13px;
}

.studio__select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #94a3b8;
  pointer-events: none;
}

/* File button */
.studio__file-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px dashed #cbd5e1;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.studio__file-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
}

.studio__fields > .studio__field:nth-of-type(n + 3),
.studio__device-section > .studio__section-label,
.studio__device-section > .studio__field {
  display: none;
}

.studio__sidebar-action {
  margin-top: auto;
}

/* Device section (inside sidebar) */
.studio__device-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-top: 0;
  border-top: 0;
}

.studio__section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0;
}
.studio__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* ── Main (center) ────────────────────────────────────── */


.studio__media-toggles {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.studio__toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 999px;
  background: #f8fafc;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.studio__toggle-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.studio__toggle-btn--off {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.studio__toggle-btn--ghost {
  background: transparent;
  border-color: transparent;
  color: #64748b;
}

.studio__toggle-btn--ghost:hover {
  background: #f1f5f9;
  color: #374151;
}

/* Stage card */
.studio__stage-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  overflow: hidden;
}

.studio__stage-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}

.studio__live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.studio__live-dot--live {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.25);
  animation: livePulse 1.4s ease-in-out infinite;
}

.studio__live-dot--off {
  background: #94a3b8;
}

@keyframes livePulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(239,68,68,0.25); }
  50% { box-shadow: 0 0 0 6px rgba(239,68,68,0.08); }
}

.studio__stage-bar-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #475569;
}

.studio__viewer-count {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.studio__stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0f172a;
  overflow: hidden;
}

:deep(.live-studio-preview__video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scaleX(-1);
}

:deep(video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.studio__stage-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  text-align: center;
}

.studio__stage-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.08);
}

.studio__stage-placeholder-title {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255,255,255,0.88);
  margin: 0;
}

.studio__stage-placeholder-desc {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255,255,255,0.5);
  max-width: 380px;
  margin: 0;
}

.studio__fullscreen-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: rgba(0, 0, 0, 0.62);
  color: #ffffff;
  cursor: pointer;
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  transition: background 0.15s, transform 0.15s;
}

.studio__fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.78);
  transform: translateY(-1px);
}

.studio__fs-overlay {
  position: absolute;
  inset: 0;
  z-index: 9;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.52), transparent 28%),
    linear-gradient(0deg, rgba(0, 0, 0, 0.72), transparent 42%);
}

.studio__fs-topbar {
  position: absolute;
  top: 22px;
  left: 22px;
  right: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.studio__fs-host {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.studio__fs-name {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.studio__fs-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 800;
}

.studio__fs-meta span,
.studio__fs-counter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.studio__fs-comments {
  position: absolute;
  left: 24px;
  right: 168px;
  bottom: 26px;
  display: flex;
  max-width: 620px;
  flex-direction: column;
  gap: 10px;
}

.studio__fs-empty {
  width: fit-content;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.52);
  padding: 10px 14px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 13px;
}

.studio__fs-comment {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.studio__fs-comment-body {
  display: grid;
  gap: 3px;
  border-radius: 20px;
  padding: 10px 14px;
  color: #ffffff;
}

.studio__fs-comment-body strong {
  color: rgba(255, 255, 255, 0.74);
  font-size: 12px;
}

.studio__fs-comment-body span {
  font-size: 15px;
  line-height: 1.45;
}

.studio__fs-actions {
  position: absolute;
  right: 24px;
  bottom: 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.studio__fs-counter {
  min-width: 62px;
  justify-content: center;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.56);
  padding: 12px 14px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  backdrop-filter: blur(12px);
}

.studio__fs-counter svg,
.studio__fs-counter :deep(svg) {
  width: 20px;
  height: 20px;
}

.studio__fs-hearts {
  position: absolute;
  inset: 0;
  z-index: 24;
  overflow: hidden;
  pointer-events: none;
}

.studio__fs-heart {
  position: absolute;
  bottom: 8%;
  width: 46px;
  height: 46px;
  object-fit: contain;
  animation: studioHeartRise 2.6s ease-out forwards;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.28));
}

.studio__stage-hearts {
  position: absolute;
  inset: 0;
  z-index: 24;
  overflow: hidden;
  pointer-events: none;
}

.studio__stage-heart {
  position: absolute;
  bottom: 8%;
  width: 46px;
  height: 46px;
  object-fit: contain;
  animation: studioHeartRise 2.6s ease-out forwards;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.28));
}

.studio__stage-activity-overlay {
  position: absolute;
  inset: 0;
  z-index: 12;
  pointer-events: none;
  background:
    linear-gradient(0deg, rgba(2, 6, 23, 0.62), transparent 42%),
    linear-gradient(90deg, rgba(2, 6, 23, 0.38), transparent 42%);
}

.studio__stage-comments {
  position: absolute;
  left: 18px;
  right: 112px;
  bottom: 18px;
  display: flex;
  max-height: 158px;
  max-width: 540px;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.studio__stage-empty {
  width: fit-content;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.54);
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.studio__stage-comment {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.studio__stage-comment-body {
  display: grid;
  gap: 2px;
  border-radius: 16px;
  padding: 8px 11px;
  color: #ffffff;
}

.studio__stage-comment-body strong {
  color: rgba(255, 255, 255, 0.74);
  font-size: 11px;
}

.studio__stage-comment-body span {
  font-size: 13px;
  line-height: 1.4;
}

.studio__stage-actions {
  position: absolute;
  right: 18px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.studio__stage-counter {
  display: inline-flex;
  min-width: 54px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.58);
  padding: 9px 11px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
}

.studio__activity-panel {
  display: none;
  gap: 14px;
  background: #ffffff;
  padding: 16px 18px 18px;
}

.studio__activity-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.studio__activity-eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.studio__activity-title {
  margin: 3px 0 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.studio__activity-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
}

.studio__activity-stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  background: #f1f5f9;
  padding: 8px 11px;
}

.studio__activity-list {
  display: grid;
  max-height: 220px;
  gap: 10px;
  overflow-y: auto;
}

.studio__activity-empty {
  border-radius: 16px;
  background: #f8fafc;
  padding: 12px 14px;
  color: #64748b;
  font-size: 13px;
}

.studio__activity-comment {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.studio__activity-comment-body {
  display: grid;
  gap: 3px;
  border-radius: 16px;
  background: #f8fafc;
  padding: 9px 12px;
  color: #0f172a;
}

.studio__activity-comment-body strong {
  color: #475569;
  font-size: 12px;
}

.studio__activity-comment-body span {
  font-size: 14px;
  line-height: 1.45;
}

@keyframes studioHeartRise {
  0% { transform: translate3d(0, 20px, 0) scale(0.72) rotate(-8deg); opacity: 0; }
  10% { opacity: 1; }
  38% { transform: translate3d(16px, -112px, 0) scale(1.02) rotate(7deg); }
  72% { opacity: 0.82; }
  100% { transform: translate3d(-18px, -280px, 0) scale(1.18) rotate(-10deg); opacity: 0; }
}

:fullscreen .studio__stage,
:-webkit-full-screen .studio__stage {
  aspect-ratio: unset;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
}


/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 1024px) {
  .studio__shell,
  .studio__shell--2col {
    grid-template-columns: 1fr;
  }

  .studio__sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .studio {
    padding: 12px 12px 40px;
  }

  .studio__shell {
    gap: 14px;
  }

  .studio__stage {
    aspect-ratio: 4 / 3;
  }
}
</style>
