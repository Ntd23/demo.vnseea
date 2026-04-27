<template>
  <WatchPresentationHero v-bind="$attrs" />
</template>

<script setup lang="ts">
import WatchPresentationHero from "../../../src/watch/presentation/components/WatchHero.vue"

defineOptions({ inheritAttrs: false })
</script>
