<template>
  <CommunityPresentationPageSettingsControlsCard v-bind="$attrs" v-model="model" />
</template>

<script setup lang="ts">
import CommunityPresentationPageSettingsControlsCard from "../../../src/community/presentation/components/PageSettingsControlsCard.vue"

const model = defineModel()
</script>
