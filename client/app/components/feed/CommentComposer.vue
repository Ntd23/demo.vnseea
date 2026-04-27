<template>
  <FeedPresentationCommentComposer v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationCommentComposer from "../../../src/feed/presentation/components/CommentComposer.vue"

defineOptions({ inheritAttrs: false })
</script>
