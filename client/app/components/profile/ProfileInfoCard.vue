<template>
  <div class="surface-card rounded-[18px] border border-[#0000ff]/10 p-3 shadow-[0_2px_14px_rgba(0,0,255,0.05)]">
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#0000ff] text-white">
        <Icon :name="icon" class="h-4 w-4" />
      </div>
      <p class="text-title-primary text-[15px] font-semibold">{{ title }}</p>
    </div>

    <div class="mt-3 divide-y divide-slate-200 rounded-[14px] border border-slate-200 bg-white">
      <div v-for="row in rows" :key="row.label" class="flex items-center gap-3 px-3 py-2.5 text-[13px]">
        <Icon :name="row.icon" class="h-4 w-4 text-slate-500" />
        <span v-if="row.left" class="flex-1 leading-6 text-slate-700">{{ row.left }}</span>
        <template v-else>
          <span v-if="row.center" class="flex-1 text-center text-slate-700">{{ row.center }}</span>
          <span v-if="row.right" :class="row.rightClass || 'text-slate-700'">{{ row.right }}</span>
        </template>
      </div>
    </div>

    <div class="mt-3 overflow-hidden rounded-[14px] border border-slate-200 bg-[#f7f9ff]">
      <div class="relative h-[260px] bg-[linear-gradient(180deg,#f8f5e9_0%,#eef3ff_38%,#f6e7ef_100%)]">
        <div class="absolute left-3 top-3 flex flex-col overflow-hidden rounded-[6px] border border-slate-300 bg-white shadow-sm">
          <button class="h-9 w-9 border-b border-slate-200 text-[22px] leading-none text-slate-700" type="button">+</button>
          <button class="h-9 w-9 text-[22px] leading-none text-slate-700" type="button">−</button>
        </div>
        <div class="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_48%_50%,rgba(43,114,255,0.75)_0,rgba(43,114,255,0.75)_7px,transparent_8px),linear-gradient(90deg,transparent_0,transparent_24%,rgba(0,0,0,0.03)_24%,rgba(0,0,0,0.03)_26%,transparent_26%,transparent_100%),linear-gradient(0deg,transparent_0,transparent_24%,rgba(0,0,0,0.03)_24%,rgba(0,0,0,0.03)_26%,transparent_26%,transparent_100%)]" />
        <div class="absolute bottom-3 right-3 text-[12px] text-slate-600">Leaflet</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  rows: Array<{
    label: string
    icon: string
    left?: string
    center?: string
    right?: string
    rightClass?: string
  }>
}>()
</script>
