<template>
  <div class="surface-card rounded-[18px] border border-[#0000ff]/10 p-3 shadow-[0_2px_14px_rgba(0,0,255,0.05)]">
    <div class="flex items-center justify-between">
      <p class="text-title-primary text-[14px]">{{ title }}</p>
      <button class="text-[12px] font-semibold text-[#0000ff] hover:underline" type="button">{{ actionLabel }}</button>
    </div>
    <div class="mt-3 grid grid-cols-2 gap-2">
      <div v-for="item in items" :key="item" class="aspect-square rounded-[12px]" :class="tileClass" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  actionLabel: string
  items: number[]
  tileClass: string
}>()
</script>
