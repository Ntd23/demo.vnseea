<template>
  <FeedRoutePage />
</template>

<script setup lang="ts">
import { useFeedSeo } from "../../src/feed/application/composables/useFeedSeo"
import FeedRoutePage from "../../src/feed/presentation/pages/FeedPage.vue"

definePageMeta({ layout: "default" })

useFeedSeo("/feed")
</script>
