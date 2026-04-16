<template>
  <div class="grid gap-3" :class="items.length > 1 ? 'md:grid-cols-2' : ''">
    <div
      v-for="item in items"
      :key="item.name"
      class="mock-image flex min-h-36 items-end rounded-[24px] border border-white/60 p-4"
    >
      <div class="rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: { name: string }[]
}>()
</script>
