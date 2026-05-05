<!-- Description: Upload-first story/status creation: pick media → preview side by side → add caption → submit. Implements FEED-005. -->
<template>
  <div class="status-create">
    <!-- Back bar -->
    <div class="status-create__topbar">
      <UButton
        to="/home"
        color="neutral"
        variant="outline"
        icon="i-ph-arrow-left-bold"
        class="rounded-[14px]"
      >
        {{ t("pages.statusCreatePage.backToFeed") }}
      </UButton>

      <div>
        <p class="status-create__eyebrow">{{ t("pages.statusCreatePage.eyebrow") }}</p>
        <h1 class="status-create__title">{{ t("pages.statusCreatePage.title") }}</h1>
      </div>
    </div>

    <!-- Main grid: upload + preview side by side on desktop -->
    <div class="status-create__grid">
      <!-- Left: drop zone + caption + submit -->
      <section class="status-create__main">

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          accept="image/*,video/*"
          class="hidden"
          type="file"
          @change="handleFileSelection"
        >

        <!-- Drop zone -->
        <div
          v-bind="dropZoneAttrs"
          class="status-create__dropzone"
          :class="{
            'status-create__dropzone--has-file': !!selectedFile,
            'status-create__dropzone--drag': isOverDropZone,
          }"
          @click="openPicker"
        >
          <template v-if="!selectedFile">
            <div class="status-create__dropzone-icon">
              <Icon name="i-ph-upload-simple-duotone" class="h-9 w-9" />
            </div>
            <p class="status-create__dropzone-heading">{{ t("pages.statusCreatePage.selectFile") }}</p>
            <p class="status-create__dropzone-hint">{{ t("pages.statusCreatePage.pickerHint") }}</p>
          </template>

          <template v-else>
            <template v-if="mediaType === 'image'">
              <NuxtImg :src="previewUrl" :alt="selectedFile.name" class="status-create__inline-preview" />
            </template>
            <template v-else>
              <div class="status-create__dropzone-icon">
                <Icon name="i-ph-video-duotone" class="h-9 w-9" />
              </div>
              <p class="status-create__dropzone-heading">{{ selectedFile.name }}</p>
            </template>

            <!-- Overlay actions -->
            <div class="status-create__file-overlay" @click.stop>
              <UButton
                color="neutral"
                variant="solid"
                size="sm"
                icon="i-ph-pencil-simple-bold"
                class="rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                @click="openPicker"
              >
                {{ t("pages.statusCreatePage.changeFile") }}
              </UButton>
              <UButton
                color="error"
                variant="solid"
                size="sm"
                icon="i-ph-trash-simple-bold"
                class="rounded-full bg-red-600/70 text-white backdrop-blur-sm hover:bg-red-600/90"
                @click="removeFile"
              >
                {{ t("pages.statusCreatePage.removeFile", "Xóa") }}
              </UButton>
            </div>
          </template>
        </div>

        <!-- Caption (revealed after file picked) -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <UCard
            v-if="selectedFile"
            class="rounded-[22px]"
            :ui="{ body: 'p-4' }"
          >
            <label class="status-create__caption-label" for="status-caption">
              {{ t("pages.statusCreatePage.captionLabel", "Chú thích") }}
            </label>
            <textarea
              id="status-caption"
              ref="captionRef"
              v-model="caption"
              class="status-create__caption-input"
              :placeholder="t('pages.statusCreatePage.captionPlaceholder', 'Thêm mô tả cho story của bạn…')"
              rows="3"
              maxlength="200"
            />
            <p class="status-create__caption-count" :class="{ 'text-red-500': caption.length > 180 }">
              {{ caption.length }}/200
            </p>
          </UCard>
        </Transition>

        <!-- Submit bar (reuse shared-kernel component) -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <FormsSubmitBar
            v-if="selectedFile"
            :cta="t('pages.statusCreatePage.submitCta')"
            :loading="submitting"
            :show-save="false"
            :submit-disabled="!selectedFile"
            :status="submitStatus"
            :status-description="statusDescription"
            class="rounded-[22px]"
            @submit="submitStory"
          />
        </Transition>
      </section>

      <!-- Right: phone preview -->
      <aside class="status-create__preview-pane">
        <p class="status-create__preview-eyebrow">{{ t("pages.statusCreatePage.previewEyebrow") }}</p>

        <div class="status-create__phone">
          <div class="status-create__phone-screen">
            <template v-if="mediaType === 'image' && previewUrl">
              <NuxtImg :src="previewUrl" :alt="t('pages.statusCreatePage.previewAlt')" class="status-create__phone-media" />
            </template>
            <template v-else-if="mediaType === 'video' && previewUrl">
              <video :src="previewUrl" class="status-create__phone-media" controls muted playsinline />
            </template>
            <template v-else>
              <div class="status-create__phone-placeholder" />
            </template>

            <div class="status-create__phone-overlay" />

            <div class="status-create__phone-bars">
              <div class="status-create__phone-bar">
                <div class="status-create__phone-bar-fill" :style="{ width: previewBarWidth }" />
              </div>
              <div class="status-create__phone-bar status-create__phone-bar--dim" />
              <div class="status-create__phone-bar status-create__phone-bar--dim" />
            </div>

            <div class="status-create__phone-author">
              <div class="status-create__phone-avatar">
                <NuxtImg v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="status-create__phone-avatar-img" />
                <span v-else>{{ currentUserInitials }}</span>
              </div>
              <div>
                <p class="status-create__phone-name">{{ currentUserName || t("pages.statusCreatePage.previewFallbackName") }}</p>
                <p class="status-create__phone-time">{{ t("pages.statusCreatePage.previewTimestamp") }}</p>
              </div>
            </div>

            <div v-if="caption" class="status-create__phone-caption">{{ caption }}</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDropZone, useTextareaAutosize } from "@vueuse/core"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import FormsSubmitBar from "../../../shared-kernel/presentation/components/forms/SubmitBar.vue"
import type { FeedStoryRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"

type MediaType = "image" | "video" | null

const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.statusCreatePage.seoTitle"),
  description: () => t("pages.statusCreatePage.seoDescription"),
})

const toast = useToast()
const router = useRouter()
const currentAuthUserStore = useCurrentAuthUserStore()
const repository = createApiFeedRepository()
const pendingCreatedStory = useState<FeedStoryRecord | null>("feed-pending-created-story", () => null)

// ── File & preview ────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)
const dropZoneRef = ref<HTMLDivElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref("")
const mediaType = ref<MediaType>(null)
const caption = ref("")

// @vueuse/core: drop zone
const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: ["image/*", "video/*", "Files"],
  onDrop(files) {
    const file = files?.[0]
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      applyFile(file)
    }
  },
})

// Bind ref to the div (must pass as v-bind because useDropZone expects a ref)
const dropZoneAttrs = { ref: dropZoneRef }

// @vueuse/core: textarea auto-size for caption
const captionRef = ref<HTMLTextAreaElement | null>(null)
useTextareaAutosize({ element: captionRef, input: caption })

// ── Submit state ──────────────────────────────────────────
const submitting = ref(false)
const submitStatus = ref<"idle" | "submitting" | "success" | "error">("idle")
const statusDescription = ref("")

// ── Auth user ─────────────────────────────────────────────
const currentUserName = computed(() => currentAuthUserStore.user?.name || "")
const currentUserAvatar = computed(() => currentAuthUserStore.user?.avatarUrl || "")
const currentUserInitials = computed(() =>
  currentUserName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "VN",
)

const previewBarWidth = computed(() => (selectedFile.value ? "76%" : "24%"))

// ── File helpers ──────────────────────────────────────────
const revokePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ""
  }
}

const applyFile = (file: File | null) => {
  revokePreview()
  selectedFile.value = file
  if (!file) { mediaType.value = null; return }
  mediaType.value = file.type.startsWith("video/") ? "video" : "image"
  previewUrl.value = URL.createObjectURL(file)
}

const openPicker = () => fileInputRef.value?.click()

const handleFileSelection = (event: Event) =>
  applyFile((event.target as HTMLInputElement).files?.[0] ?? null)

const removeFile = () => {
  applyFile(null)
  caption.value = ""
  if (fileInputRef.value) fileInputRef.value.value = ""
}

onMounted(async () => { await currentAuthUserStore.hydrate() })
onUnmounted(() => { revokePreview() })

// ── Submit ────────────────────────────────────────────────
async function submitStory() {
  if (!selectedFile.value || !mediaType.value || submitting.value) return

  submitting.value = true
  submitStatus.value = "submitting"
  statusDescription.value = t("pages.statusCreatePage.submittingStatus")

  try {
    const normalizedCaption = caption.value.trim()
    const response = await repository.createStory({
      file: selectedFile.value,
      fileType: mediaType.value,
      description: normalizedCaption || undefined,
    })
    pendingCreatedStory.value = response.story

    submitStatus.value = "success"
    statusDescription.value = t("pages.statusCreatePage.successStatus")

    toast.add({
      color: "success",
      icon: "i-ph-check-circle-fill",
      title: t("pages.statusCreatePage.toastTitle"),
      description: statusDescription.value,
    })

    window.setTimeout(() => { void router.push("/home") }, 500)
  }
  catch (error) {
    pendingCreatedStory.value = null
    submitStatus.value = "error"
    statusDescription.value = error instanceof Error ? error.message : t("pages.statusCreatePage.errorStatus")
  }
  finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ── Layout ────────────────────────────────────────── */
.status-create {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 640px) {
  .status-create { padding: 28px 24px 64px; }
}

.status-create__topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.status-create__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0;
}

.status-create__title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #0f172a;
  margin: 0;
}

/* ── Grid ─────────────────────────────────────────── */
.status-create__grid {
  display: grid;
  gap: 24px;
}

@media (min-width: 900px) {
  .status-create__grid {
    grid-template-columns: minmax(0, 1fr) 280px;
    align-items: start;
  }
}

.status-create__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Drop zone ────────────────────────────────────── */
.status-create__dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 280px;
  border-radius: 22px;
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  cursor: pointer;
  text-align: center;
  padding: 32px 24px;
  transition: border-color 0.2s ease, background 0.2s ease;
  overflow: hidden;
}

.status-create__dropzone:hover,
.status-create__dropzone--drag {
  border-color: rgba(0, 0, 255, 0.35);
  background: #eff6ff;
}

.status-create__dropzone--has-file {
  border-style: solid;
  border-color: rgba(0, 0, 255, 0.12);
  background: #fff;
  padding: 0;
  min-height: 320px;
}

.status-create__dropzone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 255, 0.08);
  color: #0000ff;
}

.status-create__dropzone-heading {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.status-create__dropzone-hint {
  font-size: 13px;
  color: #64748b;
  max-width: 340px;
  line-height: 1.6;
  margin: 0;
}

.status-create__inline-preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.status-create__file-overlay {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

/* ── Caption ──────────────────────────────────────── */
.status-create__caption-label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 8px;
}

.status-create__caption-input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fafbfe;
  padding: 12px 14px;
  font-size: 14.5px;
  line-height: 1.7;
  color: #334155;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
  overflow-y: hidden;
}

.status-create__caption-input:focus {
  border-color: rgba(0, 0, 255, 0.25);
}

.status-create__caption-count {
  font-size: 11.5px;
  color: #94a3b8;
  text-align: right;
  margin: 6px 0 0;
  transition: color 0.15s ease;
}

/* ── Preview pane ─────────────────────────────────── */
.status-create__preview-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.status-create__preview-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0;
  align-self: flex-start;
}

.status-create__phone {
  width: 100%;
  max-width: 260px;
  border-radius: 36px;
  border: 6px solid #0f172a;
  background: #0f172a;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25), 0 0 0 2px #1e293b;
  overflow: hidden;
}

.status-create__phone-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 30px;
  background: #0f172a;
}

.status-create__phone-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-create__phone-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #38bdf8 100%);
}

.status-create__phone-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, transparent 35%, rgba(15, 23, 42, 0.55) 100%);
}

.status-create__phone-bars {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
}

.status-create__phone-bar {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
  overflow: hidden;
}

.status-create__phone-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #fff;
  transition: width 0.3s ease;
}

.status-create__phone-bar--dim {
  background: rgba(255, 255, 255, 0.2);
}

.status-create__phone-author {
  position: absolute;
  top: 24px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-create__phone-avatar {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: #0000ff;
  border: 2px solid rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.status-create__phone-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-create__phone-name {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.status-create__phone-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
}

.status-create__phone-caption {
  position: absolute;
  bottom: 12px;
  left: 10px;
  right: 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  padding: 10px 12px;
  font-size: 11px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}
</style>
