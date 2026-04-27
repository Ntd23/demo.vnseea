<template>
  <ReelsPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import ReelsPresentationPage from "../../../src/reels/presentation/pages/ReelsPage.vue"

defineOptions({ inheritAttrs: false })
</script>
