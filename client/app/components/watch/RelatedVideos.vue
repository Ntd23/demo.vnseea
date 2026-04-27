<template>
  <WatchPresentationRelatedVideos v-bind="$attrs" />
</template>

<script setup lang="ts">
import WatchPresentationRelatedVideos from "../../../src/watch/presentation/components/RelatedVideos.vue"

defineOptions({ inheritAttrs: false })
</script>
