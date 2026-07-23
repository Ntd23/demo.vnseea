<!-- Description: Provides draggable, zoomable avatar and cover cropping before profile media upload. -->
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
            <div>
              <h2>{{ title }}</h2>
              <p>{{ $t("pages.profilePage.cropHint") }}</p>
            </div>
            <button type="button" :aria-label="$t('pages.profilePage.cropCancel')" @click="emit('cancel')">
              <Icon name="i-ph-x-bold" class="h-5 w-5" />
            </button>
          </header>

          <div class="profile-crop__body">
            <div
              class="profile-crop__viewport-shell"
              :class="`profile-crop__viewport-shell--${kind}`"
            >
              <img
                v-if="kind === 'avatar' && imageUrl"
                class="profile-crop__avatar-backdrop"
                :src="imageUrl"
                alt=""
                :style="avatarBackdropStyle"
                aria-hidden="true"
              >
              <div
                ref="viewportRef"
                class="profile-crop__viewport"
                :class="`profile-crop__viewport--${kind}`"
                @pointerdown="startDrag"
                @pointermove="moveDrag"
                @pointerup="finishDrag"
                @pointercancel="finishDrag"
                @wheel.prevent="handleWheel"
              >
                <img
                  v-if="imageUrl"
                  ref="imageRef"
                  :src="imageUrl"
                  :alt="title"
                  :style="imageStyle"
                  draggable="false"
                  @load="handleImageLoad"
                >
                <div class="profile-crop__guide" aria-hidden="true" />
              </div>
            </div>

            <label class="profile-crop__zoom">
              <Icon name="i-ph-minus-bold" class="h-4 w-4" />
              <input
                v-model.number="zoom"
                type="range"
                min="1"
                max="3"
                step="0.01"
                :aria-label="$t('pages.profilePage.cropZoom')"
                @input="clampOffset"
              >
              <Icon name="i-ph-plus-bold" class="h-4 w-4" />
            </label>

            <label class="profile-crop__post-text">
              <span>{{ $t("pages.profilePage.cropPostTextLabel") }}</span>
              <UTextarea
                v-model="postText"
                :placeholder="$t('pages.profilePage.cropPostTextPlaceholder')"
                :aria-label="$t('pages.profilePage.cropPostTextLabel')"
                :rows="2"
                autoresize
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
import { useResizeObserver } from "@vueuse/core"

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
const viewportRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const imageUrl = ref("")
const imageReady = ref(false)
const processing = ref(false)
const zoom = ref(1)
const postText = ref("")
const postTextFocused = ref(false)
const naturalSize = reactive({ width: 0, height: 0 })
const offset = reactive({ x: 0, y: 0 })
const drag = reactive({ active: false, pointerId: -1, x: 0, y: 0 })

const title = computed(() =>
  props.kind === "avatar"
    ? t("pages.profilePage.cropAvatarTitle")
    : t("pages.profilePage.cropCoverTitle"),
)

const baseScale = computed(() => {
  const viewport = viewportRef.value

  if (!viewport || naturalSize.width <= 0 || naturalSize.height <= 0) {
    return 1
  }

  return Math.max(
    viewport.clientWidth / naturalSize.width,
    viewport.clientHeight / naturalSize.height,
  )
})

const renderedScale = computed(() => baseScale.value * zoom.value)
const imageStyle = computed(() => ({
  width: `${naturalSize.width}px`,
  height: `${naturalSize.height}px`,
  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${renderedScale.value})`,
}))
const avatarBackdropStyle = computed(() => ({
  width: `${naturalSize.width}px`,
  height: `${naturalSize.height}px`,
  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${renderedScale.value * 1.08})`,
}))

function revokeImageUrl() {
  if (imageUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl.value)
  }

  imageUrl.value = ""
}

function resetCrop() {
  zoom.value = 1
  postText.value = ""
  postTextFocused.value = false
  offset.x = 0
  offset.y = 0
  naturalSize.width = 0
  naturalSize.height = 0
  imageReady.value = false
  drag.active = false
}

watch(
  [() => props.open, () => props.file],
  ([open, file]) => {
    revokeImageUrl()
    resetCrop()

    if (open && file && import.meta.client) {
      imageUrl.value = URL.createObjectURL(file)
    }
  },
  { immediate: true },
)

function handleImageLoad() {
  const image = imageRef.value

  if (!image) {
    return
  }

  naturalSize.width = image.naturalWidth
  naturalSize.height = image.naturalHeight
  imageReady.value = naturalSize.width > 0 && naturalSize.height > 0
  void nextTick(clampOffset)
}

function clampOffset() {
  const viewport = viewportRef.value

  if (!viewport || !imageReady.value) {
    return
  }

  const maxX = Math.max(0, (naturalSize.width * renderedScale.value - viewport.clientWidth) / 2)
  const maxY = Math.max(0, (naturalSize.height * renderedScale.value - viewport.clientHeight) / 2)

  offset.x = Math.min(maxX, Math.max(-maxX, offset.x))
  offset.y = Math.min(maxY, Math.max(-maxY, offset.y))
}

useResizeObserver(viewportRef, clampOffset)

function startDrag(event: PointerEvent) {
  if (!imageReady.value) {
    return
  }

  drag.active = true
  drag.pointerId = event.pointerId
  drag.x = event.clientX
  drag.y = event.clientY
  viewportRef.value?.setPointerCapture(event.pointerId)
}

function moveDrag(event: PointerEvent) {
  if (!drag.active || drag.pointerId !== event.pointerId) {
    return
  }

  offset.x += event.clientX - drag.x
  offset.y += event.clientY - drag.y
  drag.x = event.clientX
  drag.y = event.clientY
  clampOffset()
}

function finishDrag(event: PointerEvent) {
  if (drag.pointerId !== event.pointerId) {
    return
  }

  drag.active = false
  viewportRef.value?.releasePointerCapture(event.pointerId)
  drag.pointerId = -1
}

function handleWheel(event: WheelEvent) {
  zoom.value = Math.min(3, Math.max(1, zoom.value + (event.deltaY > 0 ? -0.08 : 0.08)))
  clampOffset()
}

async function confirmCrop() {
  const viewport = viewportRef.value
  const sourceImage = imageRef.value
  const sourceFile = props.file

  if (!viewport || !sourceImage || !sourceFile || !imageReady.value || processing.value) {
    return
  }

  processing.value = true

  try {
    const outputWidth = props.kind === "avatar" ? 800 : 1600
    const outputHeight = props.kind === "avatar"
      ? 800
      : Math.round(outputWidth * viewport.clientHeight / viewport.clientWidth)
    const sourceWidth = viewport.clientWidth / renderedScale.value
    const sourceHeight = viewport.clientHeight / renderedScale.value
    const sourceX = naturalSize.width / 2 - sourceWidth / 2 - offset.x / renderedScale.value
    const sourceY = naturalSize.height / 2 - sourceHeight / 2 - offset.y / renderedScale.value
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
      return
    }

    canvas.width = outputWidth
    canvas.height = outputHeight
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, outputWidth, outputHeight)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    context.drawImage(
      sourceImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    )

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

onBeforeUnmount(revokeImageUrl)
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
  width: min(720px, 100%);
  max-height: calc(100dvh - 32px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.34);
}

.profile-crop__header,
.profile-crop__footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.profile-crop__header {
  border-bottom: 1px solid #e8edf4;
}

.profile-crop__header h2 {
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.profile-crop__header p {
  margin-top: 3px;
  color: #64748b;
  font-size: 13px;
}

.profile-crop__header button {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  cursor: pointer;
}

.profile-crop__body {
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}

.profile-crop__viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #111827;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.profile-crop__viewport-shell--avatar {
  position: relative;
  width: min(350px, 100%);
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.42);
  /* border-radius: 20px; */
  /* background: #1e293b; */
  /* padding: 10px; */
  /* box-shadow:
    0 12px 30px rgba(15, 23, 42, 0.16),
    inset 0 0 0 1px rgba(255, 255, 255, 0.72); */
}

.profile-crop__avatar-backdrop {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  max-width: none;
  transform-origin: center;
  filter: blur(10px);
  opacity: 0.9;
  pointer-events: none;
  will-change: transform;
}

.profile-crop__viewport-shell--avatar::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(255, 255, 255, 0.12);
  content: "";
  pointer-events: none;
}

.profile-crop__viewport:active {
  cursor: grabbing;
}

.profile-crop__viewport--avatar {
  z-index: 2;
  width: 100%;
  border-radius: 9999px;
  aspect-ratio: 1;
}

.profile-crop__viewport--cover {
  border-radius: 16px;
  aspect-ratio: 8 / 3;
}

.profile-crop__viewport img {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  transform-origin: center;
  pointer-events: none;
  will-change: transform;
}

.profile-crop__guide {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 255, 255, 0.82);
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.26);
  pointer-events: none;
}

.profile-crop__zoom {
  display: grid;
  width: min(350px, 100%);
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin: 18px auto 0;
  color: #64748b;
}

.profile-crop__zoom input {
  width: 100%;
  accent-color: var(--bg-brand);
}

.profile-crop__post-text {
  display: grid;
  gap: 7px;
  margin-top: 16px;
}

.profile-crop__post-text > span {
  color: #000000;
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
  background: #ffffff;
  color: #475569;
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
    padding: 14px;
  }

  .profile-crop__header,
  .profile-crop__footer {
    padding: 14px 16px;
  }
}
</style>
