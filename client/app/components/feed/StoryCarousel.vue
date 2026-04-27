<template>
  <FeedPresentationStoryCarousel v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationStoryCarousel from "../../../src/feed/presentation/components/StoryCarousel.vue"

defineOptions({ inheritAttrs: false })
</script>
