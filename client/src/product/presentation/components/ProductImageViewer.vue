<!-- English description: Displays product images in a reusable fullscreen viewer with keyboard and gallery navigation. -->

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="product-image-viewer"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="emit('close')"
      >
        <header class="product-image-viewer__header">
          <div class="product-image-viewer__heading">
            <strong>{{ title }}</strong>
            <span v-if="images.length > 1">
              {{ normalizedIndex + 1 }} / {{ images.length }}
            </span>
          </div>

          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-ph-x-bold"
            square
            :aria-label="t('feed.lightboxModal.actionClose')"
            @click="emit('close')"
          />
        </header>

        <button
          v-if="canNavigate"
          type="button"
          class="product-image-viewer__nav product-image-viewer__nav--previous"
          :aria-label="t('feed.lightboxModal.actionPrevious')"
          @click="previous"
        >
          <Icon name="i-ph-caret-left-bold" />
        </button>

        <div
          class="product-image-viewer__stage"
          @click.stop
          @touchstart.passive="handleTouchStart"
          @touchend.passive="handleTouchEnd"
          @touchcancel="resetTouchGesture"
        >
          <img
            v-if="currentImage && !currentImageFailed"
            :src="currentImage.src"
            :alt="currentImage.alt || title"
            class="product-image-viewer__image"
            loading="eager"
            draggable="false"
            @dragstart.prevent
            @error="currentImageFailed = true"
          />

          <div v-else class="product-image-viewer__empty">
            <Icon name="i-ph-image-broken-fill" />
            <span>{{ t("feed.lightboxModal.empty") }}</span>
          </div>
        </div>

        <button
          v-if="canNavigate"
          type="button"
          class="product-image-viewer__nav product-image-viewer__nav--next"
          :aria-label="t('feed.lightboxModal.actionNext')"
          @click="next"
        >
          <Icon name="i-ph-caret-right-bold" />
        </button>

        <footer v-if="currentImage" class="product-image-viewer__footer">
          <a
            :href="currentImage.src"
            target="_blank"
            rel="noopener noreferrer"
            class="product-image-viewer__original"
          >
            <Icon name="i-ph-arrow-square-out-bold" />
            {{ t("feed.lightboxModal.actionOpenOriginal") }}
          </a>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type ProductViewerImage = {
  id?: string
  src: string
  alt?: string
}

const props = withDefaults(defineProps<{
  open?: boolean
  images: ReadonlyArray<ProductViewerImage>
  currentIndex?: number
  title: string
}>(), {
  open: false,
  currentIndex: 0,
})

const emit = defineEmits<{
  close: []
  change: [index: number]
}>()

const { t } = useI18n()
let previousBodyOverflow = ""
const currentImageFailed = ref(false)
const touchStartX = ref<number | null>(null)
const touchStartY = ref<number | null>(null)
const minimumSwipeDistance = 48

const normalizedIndex = computed(() => {
  if (props.images.length === 0) return 0

  return Math.max(0, Math.min(props.currentIndex, props.images.length - 1))
})
const currentImage = computed(() => props.images[normalizedIndex.value])
const canNavigate = computed(() => props.images.length > 1)

function previous() {
  if (!props.images.length) return

  emit("change", (normalizedIndex.value - 1 + props.images.length) % props.images.length)
}

function next() {
  if (!props.images.length) return

  emit("change", (normalizedIndex.value + 1) % props.images.length)
}

function resetTouchGesture() {
  touchStartX.value = null
  touchStartY.value = null
}

function handleTouchStart(event: TouchEvent) {
  if (!canNavigate.value || event.touches.length !== 1) {
    resetTouchGesture()
    return
  }

  touchStartX.value = event.touches[0]?.clientX ?? null
  touchStartY.value = event.touches[0]?.clientY ?? null
}

function handleTouchEnd(event: TouchEvent) {
  const startX = touchStartX.value
  const startY = touchStartY.value
  const touch = event.changedTouches[0]

  resetTouchGesture()

  if (!canNavigate.value || startX === null || startY === null || !touch) return

  const deltaX = touch.clientX - startX
  const deltaY = touch.clientY - startY

  if (Math.abs(deltaX) < minimumSwipeDistance || Math.abs(deltaX) <= Math.abs(deltaY)) return

  if (deltaX > 0) previous()
  else next()
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return

  if (event.key === "Escape") {
    event.preventDefault()
    emit("close")
  }
  else if (event.key === "ArrowLeft") {
    event.preventDefault()
    previous()
  }
  else if (event.key === "ArrowRight") {
    event.preventDefault()
    next()
  }
}

function restoreBodyScroll() {
  if (!import.meta.client) return

  document.body.style.overflow = previousBodyOverflow
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return

    if (isOpen) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
    }
    else {
      restoreBodyScroll()
    }
  },
)

watch(
  () => currentImage.value?.src,
  () => {
    currentImageFailed.value = false
    resetTouchGesture()
  },
)

onMounted(() => window.addEventListener("keydown", handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
  restoreBodyScroll()
})
</script>

<style scoped>
.product-image-viewer {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 100dvh;
  padding: 16px;
  background: color-mix(in srgb, var(--color-secondary-900) 96%, transparent);
}

.product-image-viewer__header,
.product-image-viewer__footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
}

.product-image-viewer__header {
  justify-content: space-between;
  gap: 16px;
}

.product-image-viewer__heading {
  display: grid;
  min-width: 0;
  gap: 2px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.product-image-viewer__heading strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-image-viewer__heading span {
  color: var(--text-secondary);
  font-size: 12px;
}

.product-image-viewer__stage {
  display: flex;
  min-width: 0;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 16px 64px;
  touch-action: pan-y pinch-zoom;
  user-select: none;
}

.product-image-viewer__image {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 1440px;
  object-fit: contain;
}

.product-image-viewer__empty {
  display: grid;
  justify-items: center;
  gap: 12px;
  color: color-mix(in srgb, var(--text-inverse) 76%, transparent);
}

.product-image-viewer__empty svg,
.product-image-viewer__empty :deep(svg) {
  width: 48px;
  height: 48px;
}

.product-image-viewer__nav {
  position: fixed;
  top: 50%;
  z-index: 3;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  color: var(--text-primary);
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transform: translateY(-50%);
}

.product-image-viewer__nav:hover {
  color: var(--text-brand);
  background: var(--bg-surface-active);
}

.product-image-viewer__nav:focus-visible {
  outline: 2px solid var(--bg-brand);
  outline-offset: 3px;
}

.product-image-viewer__nav svg,
.product-image-viewer__nav :deep(svg) {
  width: 26px;
  height: 26px;
}

.product-image-viewer__nav--previous {
  left: 20px;
}

.product-image-viewer__nav--next {
  right: 20px;
}

.product-image-viewer__footer {
  min-height: 36px;
  justify-content: center;
}

.product-image-viewer__original {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: color-mix(in srgb, var(--text-inverse) 88%, transparent);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.product-image-viewer__original:hover {
  color: var(--text-inverse);
}

@media (max-width: 640px) {
  .product-image-viewer {
    padding: 12px;
  }

  .product-image-viewer__stage {
    padding-inline: 32px;
  }

  .product-image-viewer__nav {
    width: 40px;
    height: 40px;
  }

  .product-image-viewer__nav--previous {
    left: 8px;
  }

  .product-image-viewer__nav--next {
    right: 8px;
  }
}
</style>
