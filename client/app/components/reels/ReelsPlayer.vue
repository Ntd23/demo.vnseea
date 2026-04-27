<template>
  <ReelsPresentationPlayer v-bind="$attrs" />
</template>

<script setup lang="ts">
import ReelsPresentationPlayer from "../../../src/reels/presentation/components/ReelsPlayer.vue"

defineOptions({ inheritAttrs: false })
</script>
