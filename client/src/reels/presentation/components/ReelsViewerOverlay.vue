<!-- English description: Hosts the reels experience in a fullscreen overlay without changing the current route. -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="viewer"
        class="reels-viewer-overlay"
        role="dialog"
        aria-modal="true"
        @touchstart.passive="handleEdgeTouchStart"
        @touchend.passive="handleEdgeTouchEnd"
      >
        <ReelsPresentationReelsPage :post-id="viewer.post.id" :initial-post="viewer.post" embedded @close="close" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useReelsViewerOverlay } from "../../application/composables/useReelsViewerOverlay"
import ReelsPresentationReelsPage from "../pages/ReelsPage.vue"

const { viewer, close } = useReelsViewerOverlay()

const modalTouchStart = ref<{ x: number, y: number } | null>(null)
let overlayHistoryEntryActive = false

function handleOverlayPopState() {
  if (!overlayHistoryEntryActive) return

  overlayHistoryEntryActive = false
  close()
}

watch(viewer, (currentViewer, previousViewer) => {
  if (!import.meta.client) return

  if (currentViewer && !previousViewer && !overlayHistoryEntryActive) {
    window.history.pushState({ ...window.history.state, reelsViewerOverlay: true }, "", window.location.href)
    overlayHistoryEntryActive = true
    return
  }

  if (!currentViewer && previousViewer && overlayHistoryEntryActive) {
    overlayHistoryEntryActive = false
    window.history.back()
  }
}, { flush: "sync" })

onMounted(() => {
  window.addEventListener("popstate", handleOverlayPopState)
})

onBeforeUnmount(() => {
  window.removeEventListener("popstate", handleOverlayPopState)
})

function handleEdgeTouchStart(event: TouchEvent) {
  const touch = event.changedTouches[0]
  const target = event.target instanceof Element ? event.target : null

  if (target?.closest("button, a, input, textarea, .reels-page__bottom-sheet")) {
    modalTouchStart.value = null
    return
  }

  modalTouchStart.value = touch
    ? { x: touch.clientX, y: touch.clientY }
    : null
}

function handleEdgeTouchEnd(event: TouchEvent) {
  const start = modalTouchStart.value
  const touch = event.changedTouches[0]
  modalTouchStart.value = null

  if (!start || !touch) return

  const deltaX = touch.clientX - start.x
  const deltaY = touch.clientY - start.y
  const isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY)
  const isLeftEdgeBackGesture = start.x <= 40 && deltaX > 72
  const isContentSwipeLeft = deltaX < -72

  if (isHorizontalGesture && (isLeftEdgeBackGesture || isContentSwipeLeft)) {
    close()
  }
}
</script>

<style scoped>
.reels-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  height: 100dvh;
  width: 100vw;
  background: #020617;
  overscroll-behavior-x: contain;
  touch-action: pan-y;
}
</style>
