<template>
  <FeedPresentationPublisherBox v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationPublisherBox from "../../../src/feed/presentation/components/FeedPublisherBox.vue"

defineOptions({ inheritAttrs: false })
</script>
