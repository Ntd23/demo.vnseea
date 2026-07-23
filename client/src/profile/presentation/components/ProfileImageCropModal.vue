<!-- Description: Provides a movable and resizable crop frame before profile media upload. -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && file"
        class="profile-crop"
        :class="{ 'profile-crop--input-focused': postTextFocused }"
        @click.self="emit('cancel')"
      >
        <section class="profile-crop__panel" role="dialog" aria-modal="true" :aria-label="title">
          <header class="profile-crop__header">
            <h2>{{ title }}</h2>
            <button type="button" :aria-label="$t('pages.profilePage.cropCancel')" @click="emit('cancel')">
              <Icon name="i-ph-x-bold" class="h-5 w-5" />
            </button>
          </header>

          <div class="profile-crop__body">
            <div
              class="profile-crop__viewport-shell"
              :class="`profile-crop__viewport-shell--${kind}`"
            >
              <div
                class="profile-crop__viewport"
                :class="`profile-crop__viewport--${kind}`"
              >
                <img
                  v-if="imageUrl"
                  ref="cropperImageRef"
                  :src="imageUrl"
                  :alt="title"
                  draggable="false"
                >
              </div>
            </div>

            <label class="profile-crop__post-text">
              <span>{{ $t("pages.profilePage.cropPostTextLabel") }}</span>
              <UTextarea
                v-model="postText"
                :placeholder="$t('pages.profilePage.cropPostTextPlaceholder')"
                :aria-label="$t('pages.profilePage.cropPostTextLabel')"
                :rows="2"
                :ui="{ base: 'rounded-xl' }"
                @focus="postTextFocused = true"
                @blur="postTextFocused = false"
              />
            </label>
          </div>

          <footer class="profile-crop__footer">
            <button type="button" class="profile-crop__cancel" @click="emit('cancel')">
              {{ $t("pages.profilePage.cropCancel") }}
            </button>
            <button
              type="button"
              class="profile-crop__confirm"
              :disabled="!imageReady || processing"
              @click="confirmCrop"
            >
              <Icon v-if="processing" name="i-ph-spinner-gap-bold" class="h-4 w-4 animate-spin" />
              <Icon v-else name="i-ph-crop-bold" class="h-4 w-4" />
              {{ $t("pages.profilePage.cropApply") }}
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import Cropper from "cropperjs"
import "cropperjs/dist/cropper.css"

type ProfileMediaKind = "avatar" | "cover"

const props = defineProps<{
  open: boolean
  file: File | null
  kind: ProfileMediaKind
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [file: File, postText: string]
}>()

const { t } = useI18n()
const cropperImageRef = ref<HTMLImageElement | null>(null)
const imageUrl = ref("")
const imageReady = ref(false)
const processing = ref(false)
const postText = ref("")
const postTextFocused = ref(false)
let cropper: Cropper | null = null

const title = computed(() =>
  props.kind === "avatar"
    ? t("pages.profilePage.cropAvatarTitle")
    : t("pages.profilePage.cropCoverTitle"),
)

function destroyCropper() {
  cropper?.destroy()
  cropper = null
  imageReady.value = false
}

function revokeImageUrl() {
  if (imageUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl.value)
  }

  imageUrl.value = ""
}

function resetCrop() {
  destroyCropper()
  postText.value = ""
  postTextFocused.value = false
}

watch(
  [() => props.open, () => props.file],
  ([open, file]) => {
    revokeImageUrl()
    resetCrop()

    if (open && file && import.meta.client) {
      imageUrl.value = URL.createObjectURL(file)
      void nextTick(initializeCropper)
    }
  },
  { immediate: true },
)

function initializeCropper() {
  const image = cropperImageRef.value

  if (!image || !props.open || !props.file) {
    return
  }

  destroyCropper()
  cropper = new Cropper(image, {
    aspectRatio: props.kind === "avatar" ? 1 : 8 / 3,
    viewMode: props.kind === "avatar" ? 1 : 3,
    dragMode: "move",
    autoCropArea: props.kind === "avatar" ? 0.8 : 1,
    responsive: true,
    restore: false,
    modal: true,
    guides: props.kind === "avatar",
    center: props.kind === "avatar",
    highlight: false,
    background: false,
    movable: true,
    rotatable: false,
    scalable: false,
    zoomable: true,
    zoomOnTouch: true,
    zoomOnWheel: true,
    wheelZoomRatio: 0.08,
    cropBoxMovable: props.kind === "avatar",
    cropBoxResizable: props.kind === "avatar",
    toggleDragModeOnDblclick: false,
    minCropBoxWidth: props.kind === "avatar" ? 180 : 0,
    minCropBoxHeight: props.kind === "avatar" ? 180 : 0,
    ready() {
      if (!cropper) {
        return
      }

      imageReady.value = true
    },
  })
}

async function confirmCrop() {
  const sourceFile = props.file

  if (!cropper || !sourceFile || !imageReady.value || processing.value) {
    return
  }

  processing.value = true

  try {
    const outputWidth = props.kind === "avatar" ? 800 : 1600
    const outputHeight = props.kind === "avatar"
      ? 800
      : 600
    const canvas = cropper.getCroppedCanvas({
      width: outputWidth,
      height: outputHeight,
      minWidth: props.kind === "avatar" ? 256 : 800,
      minHeight: props.kind === "avatar" ? 256 : 300,
      maxWidth: 4096,
      maxHeight: 4096,
      fillColor: "#ffffff",
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    })

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    )

    if (!blob) {
      return
    }

    const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || props.kind
    emit("confirm", new File([blob], `${baseName}-cropped.jpg`, { type: "image/jpeg" }), postText.value.trim())
  }
  finally {
    processing.value = false
  }
}

onBeforeUnmount(() => {
  destroyCropper()
  revokeImageUrl()
})
</script>

<style scoped>
.profile-crop {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.72);
  padding: 16px;
  backdrop-filter: blur(7px);
}

.profile-crop__panel {
  display: flex;
  width: min(680px, 100%);
  max-height: calc(100dvh - 32px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 22px;
  background: var(--bg-surface);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.34);
}

.profile-crop__header,
.profile-crop__footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px;
}

.profile-crop__header {
  border-bottom: 1px solid #e8edf4;
}

.profile-crop__header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}

.profile-crop__header button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  cursor: pointer;
}

.profile-crop__body {
  min-height: 0;
  overflow: hidden;
  padding: 14px 18px;
}

.profile-crop__viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--bg-surface);
}

.profile-crop__viewport-shell--avatar {
  position: relative;
  width: clamp(220px, calc(100dvh - 290px), 390px);
  max-width: 100%;
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid #d8dee8;
  background: var(--bg-muted);
}

.profile-crop__viewport--avatar {
  aspect-ratio: 1;
}

.profile-crop__viewport--cover {
  border: 1px solid #d8dee8;
  aspect-ratio: 8 / 3;
}

.profile-crop__viewport > img {
  display: block;
  max-width: 100%;
}

:deep(.cropper-container) {
  width: 100% !important;
  height: 100% !important;
  font-family: inherit;
}

:deep(.cropper-modal) {
  background: var(--bg-surface);
  opacity: 0.55;
}

:deep(.cropper-view-box) {
  outline: 1px solid #ffffff;
  outline-color: #ffffff;
}

:deep(.cropper-line) {
  background-color: transparent;
  opacity: 1;
}

:deep(.cropper-point) {
  width: 8px;
  height: 8px;
  border: 1px solid rgba(15, 23, 42, 0.42);
  background-color: #ffffff;
  opacity: 1;
}

:deep(.cropper-dashed) {
  border-color: #ffffff;
  opacity: 0.88;
}

:deep(.cropper-center::before),
:deep(.cropper-center::after) {
  background-color: rgba(255, 255, 255, 0.92);
}

.profile-crop__viewport--cover :deep(.cropper-view-box) {
  outline: 0;
}

.profile-crop__viewport--cover :deep(.cropper-face) {
  background-color: transparent;
}

.profile-crop__post-text {
  display: grid;
  gap: 5px;
  margin-top: 12px;
}

.profile-crop__post-text > span {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.profile-crop__footer {
  justify-content: flex-end;
  border-top: 1px solid #e8edf4;
}

.profile-crop__cancel,
.profile-crop__confirm {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
}

.profile-crop__cancel {
  border: 1px solid #dbe3ee;
  background: var(--bg-surface);
  color: var(--text-secondary);
}

.profile-crop__confirm {
  border: 1px solid var(--bg-brand);
  background: var(--bg-brand);
  color: #ffffff;
}

.profile-crop__confirm:disabled {
  cursor: wait;
  opacity: 0.55;
}

@media (max-width: 640px) {
  .profile-crop--input-focused {
    align-items: flex-start;
    overflow-y: auto;
    padding: 8px;
  }

  .profile-crop--input-focused .profile-crop__panel {
    max-height: calc(100dvh - 16px);
    margin: 0 auto;
  }

  .profile-crop--input-focused .profile-crop__body {
    scroll-padding-bottom: 16px;
  }

  .profile-crop__body {
    padding: 12px 14px;
  }

  .profile-crop__header,
  .profile-crop__footer {
    padding: 10px 14px;
  }
}
</style>
