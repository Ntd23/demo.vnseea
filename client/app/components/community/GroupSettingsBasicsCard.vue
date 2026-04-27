<template>
  <CommunityPresentationGroupSettingsBasicsCard v-bind="$attrs" v-model="model" />
</template>

<script setup lang="ts">
import CommunityPresentationGroupSettingsBasicsCard from "../../../src/community/presentation/components/GroupSettingsBasicsCard.vue"

const model = defineModel()
</script>
