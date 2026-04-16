<template>
  <UDrawer :open="open" :title="title">
    <template #body>
      <slot />
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
</script>
