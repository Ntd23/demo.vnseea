<template>
  <FeedPresentationCommentItem v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationCommentItem from "../../../src/feed/presentation/components/CommentItem.vue"

defineOptions({ inheritAttrs: false })
</script>
