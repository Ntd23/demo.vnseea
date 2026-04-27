<template>
  <FeedPresentationShareModal v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationShareModal from "../../../src/feed/presentation/components/ShareModal.vue"

defineOptions({ inheritAttrs: false })
</script>
