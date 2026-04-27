<template>
  <ExplorePresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import ExplorePresentationPage from "../../../src/explore/presentation/pages/ExplorePage.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
