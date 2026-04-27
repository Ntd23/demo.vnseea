<template>
  <CommunityPresentationPageHeroBanner
    v-bind="$attrs"
    @follow="$emit('follow')"
    @share="$emit('share')"
  />
</template>

<script setup lang="ts">
import CommunityPresentationPageHeroBanner from "../../../src/community/presentation/components/PageHeroBanner.vue"

defineEmits(["follow", "share"])
</script>
