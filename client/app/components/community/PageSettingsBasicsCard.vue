<template>
  <CommunityPresentationPageSettingsBasicsCard v-bind="$attrs" v-model="model" />
</template>

<script setup lang="ts">
import CommunityPresentationPageSettingsBasicsCard from "../../../src/community/presentation/components/PageSettingsBasicsCard.vue"

const model = defineModel()
</script>
