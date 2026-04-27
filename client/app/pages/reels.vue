<template>
  <ReelsRoutePage />
</template>

<script setup lang="ts">
import { useReelsSeo } from "../../src/reels/application/composables/useReelsSeo"
import ReelsRoutePage from "../components/pages/ReelsPage.vue"

definePageMeta({
  layout: 'default',
})

useReelsSeo()
</script>
