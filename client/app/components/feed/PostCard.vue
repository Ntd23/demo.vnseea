<template>
  <FeedPresentationPostCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationPostCard from "../../../src/feed/presentation/components/PostCard.vue"

defineOptions({ inheritAttrs: false })
</script>
