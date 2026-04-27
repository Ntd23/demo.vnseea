<template>
  <CommunityPresentationGroupMembersCard v-bind="$attrs" @invite="$emit('invite')" />
</template>

<script setup lang="ts">
import CommunityPresentationGroupMembersCard from "../../../src/community/presentation/components/GroupMembersCard.vue"

defineEmits(["invite"])
</script>
