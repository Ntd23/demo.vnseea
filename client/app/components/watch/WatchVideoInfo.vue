<template>
  <WatchPresentationVideoInfo v-bind="$attrs" />
</template>

<script setup lang="ts">
import WatchPresentationVideoInfo from "../../../src/watch/presentation/components/WatchVideoInfo.vue"

defineOptions({ inheritAttrs: false })
</script>
