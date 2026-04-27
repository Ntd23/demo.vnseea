<template>
  <ReelsPresentationOverlay v-bind="$attrs" />
</template>

<script setup lang="ts">
import ReelsPresentationOverlay from "../../../src/reels/presentation/components/ReelsOverlay.vue"

defineOptions({ inheritAttrs: false })
</script>
