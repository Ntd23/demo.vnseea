<!-- English description: Thin Nuxt route wrapper for a single feed post detail page used by notification deep links. -->
<template>
  <FeedPresentationPostDetailPage :post-id="postId" />
</template>

<script setup lang="ts">
import FeedPresentationPostDetailPage from "../../../src/feed/presentation/pages/PostDetailPage.vue"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const postId = computed(() => Number(route.params.id ?? 0) || 0)
</script>
