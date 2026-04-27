<template>
  <WatchPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import WatchPresentationPage from "../../../src/watch/presentation/pages/WatchPage.vue"

defineOptions({ inheritAttrs: false })
</script>
