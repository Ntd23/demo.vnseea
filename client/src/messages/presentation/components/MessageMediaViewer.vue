<!-- English description: Displays message image and video attachments in an accessible fullscreen viewer shared by the messages page and chat widget. -->
<template>
  <Teleport to="body">
    <Transition name="message-media-viewer">
      <div
        v-if="open"
        class="message-media-viewer"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="emit('close')"
      >
        <header class="message-media-viewer__header">
          <strong>{{ title }}</strong>

          <button
            ref="closeButton"
            type="button"
            class="message-media-viewer__close"
            :aria-label="t('pages.messagesPage.close')"
            @click="emit('close')"
          >
            <Icon name="i-ph-x-bold" />
          </button>
        </header>

        <div class="message-media-viewer__stage" @click.stop>
          <img
            v-if="type === 'image' || type === 'gif'"
            :src="src"
            :alt="alt || title"
            class="message-media-viewer__image"
          >
          <video
            v-else-if="type === 'video'"
            :src="src"
            class="message-media-viewer__video"
            controls
            playsinline
            autoplay
          />
        </div>

        <footer class="message-media-viewer__footer">
          <a
            :href="src"
            target="_blank"
            rel="noopener noreferrer"
            class="message-media-viewer__original"
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
const props = defineProps<{
  open: boolean
  src: string
  type: "image" | "gif" | "video"
  alt?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const closeButton = ref<HTMLButtonElement | null>(null)
let previousBodyOverflow = ""
let bodyScrollLocked = false

const title = computed(() =>
  props.type === "video"
    ? t("pages.messagesPage.video")
    : t("pages.messagesPage.attachmentLabel"),
)

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape") return

  event.preventDefault()
  emit("close")
}

function restoreBodyScroll() {
  if (!import.meta.client || !bodyScrollLocked) return

  document.body.style.overflow = previousBodyOverflow
  bodyScrollLocked = false
  window.removeEventListener("keydown", handleKeydown)
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!import.meta.client) return

    if (isOpen) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      bodyScrollLocked = true
      window.addEventListener("keydown", handleKeydown)
      await nextTick()
      if (props.open) {
        closeButton.value?.focus()
      }
      return
    }

    restoreBodyScroll()
  },
)

onBeforeUnmount(restoreBodyScroll)
</script>

<style scoped>
.message-media-viewer {
  position: fixed;
  inset: 0;
  z-index: 11000;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 100dvh;
  padding: 16px;
  background: rgb(5 12 24 / 94%);
  backdrop-filter: blur(8px);
}

.message-media-viewer__header,
.message-media-viewer__footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
}

.message-media-viewer__header {
  min-width: 0;
  justify-content: space-between;
  gap: 16px;
  color: var(--text-inverse);
}

.message-media-viewer__header strong {
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-media-viewer__close {
  display: inline-flex;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
  background: rgb(255 255 255 / 10%);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.message-media-viewer__close:hover {
  background: rgb(255 255 255 / 18%);
  transform: scale(1.04);
}

.message-media-viewer__close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.message-media-viewer__stage {
  display: flex;
  min-width: 0;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.message-media-viewer__image,
.message-media-viewer__video {
  display: block;
  width: auto;
  height: auto;
  max-width: min(94vw, 1440px);
  max-height: calc(100dvh - 150px);
  border-radius: 12px;
  background: #000;
  box-shadow: 0 24px 80px rgb(0 0 0 / 42%);
  object-fit: contain;
}

.message-media-viewer__video {
  width: min(94vw, 1440px);
}

.message-media-viewer__footer {
  min-height: 38px;
  justify-content: center;
}

.message-media-viewer__original {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: rgb(255 255 255 / 84%);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.message-media-viewer__original:hover {
  color: #fff;
}

.message-media-viewer-enter-active,
.message-media-viewer-leave-active {
  transition: opacity 0.18s ease;
}

.message-media-viewer-enter-from,
.message-media-viewer-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .message-media-viewer {
    padding: 10px;
  }

  .message-media-viewer__stage {
    padding: 10px 0;
  }

  .message-media-viewer__image,
  .message-media-viewer__video {
    max-width: 100%;
    max-height: calc(100dvh - 128px);
    border-radius: 8px;
  }
}
</style>
