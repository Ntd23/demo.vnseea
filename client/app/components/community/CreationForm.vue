<template>
  <CommunityPresentationCreationForm v-bind="$attrs" v-model="model" @submit="$emit('submit')" />
</template>

<script setup lang="ts">
import CommunityPresentationCreationForm from "../../../src/community/presentation/components/CreationForm.vue"

const model = defineModel()

defineEmits(["submit"])
</script>
