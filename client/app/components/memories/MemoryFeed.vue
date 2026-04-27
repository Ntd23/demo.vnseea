<template>
  <MemoriesPresentationMemoryFeed v-bind="$attrs" />
</template>

<script setup lang="ts">
import MemoriesPresentationMemoryFeed from "../../../src/memories/presentation/components/MemoryFeed.vue"

defineOptions({ inheritAttrs: false })
</script>
