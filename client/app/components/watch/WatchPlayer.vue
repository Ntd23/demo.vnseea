<template>
  <WatchPresentationPlayer v-bind="$attrs" />
</template>

<script setup lang="ts">
import WatchPresentationPlayer from "../../../src/watch/presentation/components/WatchPlayer.vue"

defineOptions({ inheritAttrs: false })
</script>
