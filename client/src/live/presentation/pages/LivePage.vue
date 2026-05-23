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
            <UAlert v-if="bootstrapErrorMessage" color="error" variant="soft" title="Không tải được studio" :description="bootstrapErrorMessage" class="rounded-2xl" />
            <UAlert v-else-if="blockedReasonMessage" color="warning" variant="soft" title="Studio bị chặn" :description="blockedReasonMessage" class="rounded-2xl" />
            <UAlert v-if="errorMessage" color="error" variant="soft" title="Có lỗi xảy ra" :description="errorMessage" class="rounded-2xl" />
            <UAlert v-if="statusMessage" :color="liveState === 'offline' ? 'neutral' : 'primary'" variant="soft" title="Trạng thái" :description="statusMessage" class="rounded-2xl" />
          </div>

          <!-- Host info -->
          <div class="studio__host">
            <UAvatar
              :src="bootstrap.host?.avatarUrl || undefined"
              :alt="bootstrap.host?.name || 'Host'"
              size="lg"
              class="shrink-0"
              :ui="{ rounded: 'rounded-2xl' }"
            />
            <div class="min-w-0">
              <p class="studio__host-name">{{ bootstrap.host?.name || "Host" }}</p>
              <p class="studio__host-role">{{ bootstrap.host?.note || "Người tổ chức" }}</p>
            </div>
          </div>

          <!-- Setup fields -->
          <div class="studio__fields">
            <div class="studio__field">
              <label class="studio__label">Nơi đăng</label>
              <div class="studio__select-wrap">
                <select :value="bootstrap.destination" disabled class="studio__select">
                  <option v-for="opt in bootstrap.destinationOptions" :key="opt.value" :value="opt.value">
                    {{ opt.value === "timeline" ? "Timeline cá nhân" : opt.label }}
                  </option>
                </select>
                <Icon name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__field">
              <label class="studio__label">Quyền riêng tư</label>
              <div class="studio__select-wrap">
                <select v-model="privacy" class="studio__select" :disabled="Boolean(session)">
                  <option v-for="opt in bootstrap.privacyOptions" :key="opt.value" :value="opt.value">
                    {{ privacyLabel(opt.value) }}
                  </option>
                </select>
                <Icon name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__field">
              <label class="studio__label">Tiêu đề buổi live</label>
              <UInput
                v-model="title"
                placeholder="Ví dụ: Cập nhật dự án tuần này"
                :disabled="Boolean(session)"
                :ui="{ base: 'rounded-2xl bg-white border-slate-200 focus:border-blue-500' }"
              />
            </div>

            <div class="studio__field">
              <label class="studio__label">Mô tả</label>
              <UTextarea
                v-model="description"
                :rows="3"
                placeholder="Mô tả ngắn nội dung buổi live..."
                :disabled="Boolean(session)"
                :ui="{ base: 'rounded-2xl bg-white border-slate-200 focus:border-blue-500' }"
              />
            </div>

            <div class="studio__field">
              <label class="studio__label">Thumbnail</label>
              <label class="studio__file-btn">
                <Icon name="i-ph-image-duotone" class="h-4 w-4 text-slate-500" />
                <span>{{ thumbnailFile ? thumbnailFile.name : "Chọn ảnh thumbnail" }}</span>
                <input type="file" accept="image/*" class="sr-only" @change="handleThumbnailChange">
              </label>
            </div>
          </div>

          <!-- Device controls -->
          <div class="studio__device-section">
            <p class="studio__section-label">Thiết bị</p>
            <div class="studio__field">
              <label class="studio__label">Camera</label>
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
                <Icon name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__field">
              <label class="studio__label">Microphone</label>
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
                <Icon name="i-ph-caret-down-bold" class="studio__select-icon" />
              </div>
            </div>

            <div class="studio__media-toggles">
              <button class="studio__toggle-btn" :class="{ 'studio__toggle-btn--off': videoMuted }" type="button" @click="toggleVideo">
                <Icon :name="videoMuted ? 'i-ph-video-camera-slash-bold' : 'i-ph-video-camera-bold'" class="h-4 w-4" />
                <span>{{ videoMuted ? "Bật cam" : "Tắt cam" }}</span>
              </button>
              <button class="studio__toggle-btn" :class="{ 'studio__toggle-btn--off': audioMuted }" type="button" @click="toggleAudio">
                <Icon :name="audioMuted ? 'i-ph-microphone-slash-bold' : 'i-ph-microphone-bold'" class="h-4 w-4" />
                <span>{{ audioMuted ? "Bật mic" : "Tắt mic" }}</span>
              </button>
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
                <Icon name="i-ph-broadcast-bold" class="h-5 w-5" />
              </template>
              Phát trực tiếp
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
                <Icon name="i-ph-stop-circle-bold" class="h-5 w-5" />
              </template>
              Kết thúc livestream
            </UButton>
          </div>
        </template>
      </aside>

      <!-- ── CENTER: Stage ────────────────────────────── -->
      <main class="studio__main">

        <!-- Video stage -->
        <div class="studio__stage-card">
          <!-- Stage status bar -->
          <div class="studio__stage-bar">
            <div class="flex items-center gap-2">
              <span class="studio__live-dot" :class="session ? 'studio__live-dot--live' : 'studio__live-dot--off'" />
              <span class="studio__stage-bar-label">{{ session ? "ĐANG PHÁT" : "XEM TRƯỚC" }}</span>
            </div>
            <div class="flex items-center gap-3">
              <UBadge
                :color="liveStateBadgeColor"
                variant="soft"
                class="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              >
                {{ liveStateLabel }}
              </UBadge>
              <div class="studio__viewer-count">
                <Icon name="i-ph-eye-duotone" class="h-3.5 w-3.5" />
                <span>{{ viewerCount }}</span>
              </div>
            </div>
          </div>

          <!-- Video frame + fullscreen overlay -->
          <div ref="previewStageHost" class="studio__stage">
            <div v-if="showStagePlaceholder" class="studio__stage-placeholder">
              <div class="studio__stage-icon-wrap">
                <Icon name="i-ph-video-camera-duotone" class="h-10 w-10 text-slate-300" />
              </div>
              <p class="studio__stage-placeholder-title">{{ stageTitle }}</p>
              <p class="studio__stage-placeholder-desc">{{ stageDescription }}</p>
            </div>
            <!-- Fullscreen icon (overlay, inside video) -->
            <button class="studio__fullscreen-btn" type="button" @click="toggleFullscreen">
              <Icon :name="isFullscreen ? 'i-ph-arrows-in-bold' : 'i-ph-arrows-out-bold'" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
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
  if (v === "1") return "Bạn bè / người theo dõi"
  if (v === "2") return "Người theo dõi bạn"
  if (v === "3") return "Chỉ mình tôi"
  return "Công khai"
}

const liveStateLabel = computed(() => {
  if (liveState.value === "live") return "Đang phát"
  if (liveState.value === "stale") return "Mất heartbeat"
  return "Ngoại tuyến"
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
  if (!mediaSupported.value) return "Trình duyệt không hỗ trợ camera / microphone"
  if (previewLoading.value) return "Đang khởi động camera..."
  if (previewError.value) return "Không thể mở camera"
  if (videoMuted.value) return "Camera đang tắt"
  if (session.value) return "Preview đang sẵn sàng"
  return "Kết nối camera trước khi phát"
})

const stageDescription = computed(() => {
  if (previewError.value) return previewError.value
  if (!mediaSupported.value) return "Thử trình duyệt desktop mới hơn hoặc cấp quyền camera / mic."
  if (previewLoading.value) return "Studio đang xin quyền thiết bị và dựng preview local."
  if (videoMuted.value) return "Bật camera để hiển thị khung hình trên sân khấu."
  if (session.value) return "Đang publish lên phòng LiveKit."
  return "Sau khi camera sẵn sàng, nhập tiêu đề rồi bắt đầu livestream."
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
  border: 1px solid #e2e8f0;
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
  border: 1px solid #e2e8f0;
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
  border: 1px solid #e2e8f0;
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

.studio__sidebar-action {
  margin-top: auto;
}

/* Device section (inside sidebar) */
.studio__device-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
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
  margin-top: 14px;
  flex-wrap: wrap;
}

.studio__toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
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
  border-color: #e2e8f0;
  color: #374151;
}

/* Stage card */
.studio__stage-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
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
  background: #020617;
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
  bottom: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.15s;
}

.studio__fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.65);
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
