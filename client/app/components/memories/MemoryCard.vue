<template>
  <MemoriesPresentationMemoryCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import MemoriesPresentationMemoryCard from "../../../src/memories/presentation/components/MemoryCard.vue"

defineOptions({ inheritAttrs: false })
</script>
