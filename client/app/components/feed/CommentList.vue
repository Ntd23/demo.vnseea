<template>
  <FeedPresentationCommentList v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationCommentList from "../../../src/feed/presentation/components/CommentList.vue"

defineOptions({ inheritAttrs: false })
</script>
