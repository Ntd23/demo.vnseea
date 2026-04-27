<template>
  <CommunityPresentationGroupSettingsControlsCard v-bind="$attrs" v-model="model" />
</template>

<script setup lang="ts">
import CommunityPresentationGroupSettingsControlsCard from "../../../src/community/presentation/components/GroupSettingsControlsCard.vue"

const model = defineModel()
</script>
