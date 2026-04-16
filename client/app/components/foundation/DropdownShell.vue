<template>
  <UDropdownMenu :items="items">
    <slot />
  </UDropdownMenu>
</template>

<script setup lang="ts">
defineProps<{ items: unknown[] }>()
</script>
