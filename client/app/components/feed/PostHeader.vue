<template>
  <FeedPresentationPostHeader v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationPostHeader from "../../../src/feed/presentation/components/PostHeader.vue"

defineOptions({ inheritAttrs: false })
</script>
