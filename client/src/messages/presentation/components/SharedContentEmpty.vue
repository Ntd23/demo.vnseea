<!-- English description: Displays the empty state used by shared media, file, and link tabs. -->
<template>
  <div class="py-6 text-center">
    <Icon name="i-ph-folder-open-bold" class="mx-auto h-6 w-6 text-[var(--text-tertiary)]" />
    <p class="mt-2 text-xs text-[var(--text-secondary)]">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>
