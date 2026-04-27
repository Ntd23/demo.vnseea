<template>
  <MemoriesPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import MemoriesPresentationPage from "../../../src/memories/presentation/pages/MemoriesPage.vue"

defineOptions({ inheritAttrs: false })
</script>
