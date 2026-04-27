<template>
  <CommunityPresentationPageActionCard
    v-bind="$attrs"
    @follow="$emit('follow')"
    @message="$emit('message')"
  />
</template>

<script setup lang="ts">
import CommunityPresentationPageActionCard from "../../../src/community/presentation/components/PageActionCard.vue"

defineEmits(["follow", "message"])
</script>
