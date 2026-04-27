<template>
  <WatchRoutePage />
</template>

<script setup lang="ts">
import { useWatchSeo } from "../../src/watch/application/composables/useWatchSeo"
import WatchRoutePage from "../components/pages/WatchPage.vue"

definePageMeta({
  layout: "default",
})

useWatchSeo()
</script>
