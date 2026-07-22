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
      <div v-if="viewer" class="reels-viewer-overlay" role="dialog" aria-modal="true">
        <ReelsPresentationReelsPage :post-id="viewer.post.id" :initial-post="viewer.post" embedded @close="close" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useReelsViewerOverlay } from "../../application/composables/useReelsViewerOverlay"
import ReelsPresentationReelsPage from "../pages/ReelsPage.vue"

const { viewer, close } = useReelsViewerOverlay()
</script>

<style scoped>
.reels-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  height: 100dvh;
  width: 100vw;
  background: #020617;
}
</style>
