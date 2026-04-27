<template>
  <WatchPresentationFilters v-bind="$attrs" />
</template>

<script setup lang="ts">
import WatchPresentationFilters from "../../../src/watch/presentation/components/WatchFilters.vue"

defineOptions({ inheritAttrs: false })
</script>
