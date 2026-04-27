<template>
  <CommunityPresentationGroupHeroBanner v-bind="$attrs" @join="$emit('join')" @invite="$emit('invite')" />
</template>

<script setup lang="ts">
import CommunityPresentationGroupHeroBanner from "../../../src/community/presentation/components/GroupHeroBanner.vue"

defineEmits(["join", "invite"])
</script>
