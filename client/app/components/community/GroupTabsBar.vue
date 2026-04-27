<template>
  <CommunityPresentationGroupTabsBar v-bind="$attrs" @update:modelValue="$emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import CommunityPresentationGroupTabsBar from "../../../src/community/presentation/components/GroupTabsBar.vue"

defineEmits(["update:modelValue"])
</script>
