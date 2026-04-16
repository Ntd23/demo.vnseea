<template>
  <UModal :open="open" :title="title">
    <template #body>
      <slot />
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
</script>
