<template>
  <ExplorePresentationUserSpotlightCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import ExplorePresentationUserSpotlightCard from "../../../src/explore/presentation/components/UserSpotlightCard.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
