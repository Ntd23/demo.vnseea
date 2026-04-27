<template>
  <WatchPresentationComments v-bind="$attrs" />
</template>

<script setup lang="ts">
import WatchPresentationComments from "../../../src/watch/presentation/components/WatchComments.vue"

defineOptions({ inheritAttrs: false })
</script>
