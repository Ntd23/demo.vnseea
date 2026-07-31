<!-- Description: Reusable editor for dragging and saving a cover inside its visible frame. -->
<template>
  <div class="cover-reposition" @click.stop>
    <div class="cover-reposition__crop">
      <img
        v-if="imageUrl"
        ref="imageRef"
        :src="imageUrl"
        :alt="t('pages.profilePage.cropCoverTitle')"
        draggable="false"
      >
    </div>

    <div class="cover-reposition__hint">
      <Icon name="i-ph-arrows-out-cardinal-bold" />
      <span>{{ t("pages.profilePage.coverRepositionHint") }}</span>
    </div>

    <div class="cover-reposition__actions">
      <button
        type="button"
        class="cover-reposition__action cover-reposition__action--save"
        :disabled="!ready || saving || processing"
        :aria-label="t('pages.profilePage.cropApply')"
        @click="confirm"
      >
        <Icon
          :name="saving || processing ? 'i-ph-spinner-gap-bold' : 'i-ph-check-bold'"
          :class="{ 'cover-reposition__spinner': saving || processing }"
        />
      </button>
      <button
        type="button"
        class="cover-reposition__action"
        :disabled="saving || processing"
        :aria-label="t('pages.profilePage.cropCancel')"
        @click="emit('cancel')"
      >
        <Icon name="i-ph-x-bold" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Cropper from "cropperjs"
import "cropperjs/dist/cropper.css"

const props = defineProps<{
  file: File
  saving?: boolean
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [file: File]
}>()

const { t } = useI18n()
const imageRef = ref<HTMLImageElement | null>(null)
const imageUrl = ref("")
const ready = ref(false)
const processing = ref(false)
let cropper: Cropper | null = null

function revokeImageUrl() {
  if (imageUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl.value)
  }

  imageUrl.value = ""
}

function destroyCropper() {
  cropper?.destroy()
  cropper = null
  ready.value = false
}

function initialize() {
  const image = imageRef.value

  if (!image) {
    return
  }

  destroyCropper()
  cropper = new Cropper(image, {
    aspectRatio: 918 / 332,
    viewMode: 3,
    dragMode: "move",
    autoCropArea: 1,
    responsive: true,
    restore: false,
    modal: false,
    guides: false,
    center: false,
    highlight: false,
    background: false,
    movable: true,
    rotatable: false,
    scalable: false,
    zoomable: false,
    zoomOnTouch: false,
    zoomOnWheel: false,
    cropBoxMovable: false,
    cropBoxResizable: false,
    toggleDragModeOnDblclick: false,
    ready() {
      ready.value = true
    },
  })
}

watch(
  () => props.file,
  (file) => {
    destroyCropper()
    revokeImageUrl()

    if (!import.meta.client) {
      return
    }

    imageUrl.value = URL.createObjectURL(file)
    void nextTick(initialize)
  },
  { immediate: true },
)

async function confirm() {
  if (!cropper || !ready.value || processing.value || props.saving) {
    return
  }

  processing.value = true

  try {
    const canvas = cropper.getCroppedCanvas({
      width: 1836,
      height: 664,
      minWidth: 1836,
      minHeight: 664,
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

    const baseName = props.file.name.replace(/\.[^.]+$/, "") || "cover"
    emit("confirm", new File([blob], `${baseName}-cropped.jpg`, { type: "image/jpeg" }))
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
.cover-reposition {
  position: absolute;
  z-index: 20;
  inset: 0;
  overflow: hidden;
  background: var(--bg-media);
  cursor: move;
  touch-action: none;
}

.cover-reposition__crop,
.cover-reposition__crop > img {
  display: block;
  width: 100%;
  height: 100%;
}

.cover-reposition__crop > img {
  max-width: 100%;
  object-fit: cover;
}

:deep(.cropper-container) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.cropper-view-box) {
  outline: 0;
}

:deep(.cropper-face) {
  background: transparent;
}

:deep(.cropper-line),
:deep(.cropper-point),
:deep(.cropper-dashed),
:deep(.cropper-center) {
  display: none;
}

.cover-reposition__hint {
  position: absolute;
  top: 16px;
  left: 50%;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-media);
  border-radius: 8px;
  background: color-mix(in srgb, var(--bg-media) 58%, transparent);
  padding: 9px 18px;
  color: var(--text-media);
  font-size: 13px;
  font-weight: 750;
  pointer-events: none;
  transform: translateX(-50%);
  backdrop-filter: blur(8px);
}

.cover-reposition__actions {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-reposition__action {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--border-media);
  border-radius: 7px;
  background: color-mix(in srgb, var(--bg-media) 68%, transparent);
  color: var(--text-media);
  cursor: pointer;
  font-size: 21px;
  backdrop-filter: blur(8px);
}

.cover-reposition__action--save {
  background: color-mix(in srgb, var(--color-success) 82%, var(--bg-media));
}

.cover-reposition__action:disabled {
  cursor: wait;
  opacity: 0.58;
}

.cover-reposition__spinner {
  animation: coverRepositionSpin 0.8s linear infinite;
}

@keyframes coverRepositionSpin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .cover-reposition__hint {
    top: 12px;
    max-width: calc(100% - 130px);
    padding: 8px 11px;
    font-size: 11px;
    white-space: nowrap;
  }

  .cover-reposition__actions {
    top: 8px;
    left: 8px;
  }

  .cover-reposition__action {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
</style>
