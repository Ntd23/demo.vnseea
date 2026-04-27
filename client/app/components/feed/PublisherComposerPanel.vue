<template>
  <FeedPresentationPublisherComposerPanel v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationPublisherComposerPanel from "../../../src/feed/presentation/components/PublisherComposerPanel.vue"

defineOptions({ inheritAttrs: false })
</script>
