<template>
  <NuxtLink :to="to" class="flex items-center gap-2.5">
    <div
      class="flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-black text-white"
      :class="inverted ? 'bg-white/16 ring-1 ring-white/20' : 'bg-[var(--brand-ink)]'"
    >
      V
    </div>
    <div>
      <p
        class="text-[10px] font-semibold uppercase tracking-[0.28em]"
        :class="inverted ? 'text-white/70' : 'text-primary-600'"
      >
        Social hub
      </p>
      <p class="text-sm font-black leading-none" :class="inverted ? 'text-white' : 'text-slate-900'">VNSEEA</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  inverted?: boolean
  to?: string
}>(), {
  inverted: true,
  to: "/",
})
</script>
