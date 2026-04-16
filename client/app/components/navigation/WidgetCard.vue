<template>
  <div class="rounded-[24px] border border-[#d8e1ff] bg-white p-4 shadow-[0_10px_26px_rgba(15,35,110,0.05)]">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-900">{{ title }}</h3>
      <span class="rounded-full border border-[#dfe7ff] bg-[#f6f8ff] px-2.5 py-1 text-[10px] font-bold text-[#4b67ff]">Mock</span>
    </div>
    <div class="space-y-2.5">
      <div v-for="item in items" :key="item.title" class="rounded-[18px] border border-[#eef2fb] bg-[#fbfcff] p-3">
        <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
        <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ item.subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  items: { title: string; subtitle: string }[]
}>()
</script>
