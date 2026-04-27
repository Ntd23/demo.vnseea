<template>
  <FeedPresentationPostMediaGrid v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationPostMediaGrid from "../../../src/feed/presentation/components/PostMediaGrid.vue"

defineOptions({ inheritAttrs: false })
</script>
