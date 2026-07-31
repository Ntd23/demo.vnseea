<!-- Description: Displays one image in a reusable full-screen viewer. -->
<template>
  <Teleport to="body">
    <Transition name="image-viewer">
      <div
        v-if="open && src"
        class="image-viewer"
        role="dialog"
        aria-modal="true"
        :aria-label="alt"
        @click="emit('close')"
      >
        <button
          type="button"
          class="image-viewer__close"
          :aria-label="t('pages.profilePage.cropCancel')"
          @click.stop="emit('close')"
        >
          <Icon name="i-ph-x-bold" class="h-5 w-5" />
        </button>
        <img
          :src="src"
          :alt="alt"
          class="image-viewer__image"
          @click.stop
        >
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  src: string
  alt: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

watch(
  () => props.open,
  (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? "hidden" : ""
  },
  { immediate: true },
)

onMounted(() => window.addEventListener("keydown", handleKeydown))

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
  document.body.style.overflow = ""
})
</script>

<style scoped>
.image-viewer {
  position: fixed;
  z-index: 10040;
  inset: 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--bg-media) 92%, transparent);
  padding: 68px 24px 24px;
  cursor: zoom-out;
  backdrop-filter: blur(6px);
}

.image-viewer__image {
  display: block;
  max-width: min(1280px, 96vw);
  max-height: calc(100dvh - 92px);
  object-fit: contain;
  border-radius: 10px;
  box-shadow: var(--shadow-xl);
  cursor: default;
}

.image-viewer__close {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--border-media);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-media) 68%, transparent);
  color: var(--text-media);
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.image-viewer-enter-active,
.image-viewer-leave-active {
  transition: opacity 150ms ease;
}

.image-viewer-enter-from,
.image-viewer-leave-to {
  opacity: 0;
}
</style>
