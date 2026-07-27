<!-- English description: Displays profile information rows and a themed location preview card. -->
<template>
  <div class="surface-card p-4 space-y-4">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-surface-active)] text-[var(--icon-brand)] shadow-[var(--shadow-sm)] border border-[var(--border-light)]">
        <Icon :name="icon" class="h-5 w-5" />
      </div>
      <p class="text-base font-black text-[var(--text-primary)] tracking-tight">{{ title }}</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] divide-y divide-[var(--border-light)]">
      <div v-for="row in rows" :key="row.label" class="flex items-center gap-4 px-4 py-3.5 group transition-colors hover:bg-[var(--bg-surface-hover)]">
        <Icon :name="row.icon" class="h-5 w-5 text-[var(--icon-secondary)] group-hover:text-[var(--icon-brand)] transition-colors" />
        <span v-if="row.left" class="flex-1 text-sm font-semibold text-[var(--text-primary)]">{{ row.left }}</span>
        <template v-else>
          <span v-if="row.center" class="flex-1 text-center text-sm font-bold text-[var(--text-primary)]">{{ row.center }}</span>
          <span v-if="row.right" :class="[row.rightClass || 'text-[var(--text-primary)]', 'text-sm font-bold']">{{ row.right }}</span>
        </template>
      </div>
    </div>

    <!-- Premium Map Preview Placeholder -->
    <div class="group relative mt-4 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-muted)] aspect-[4/3] sm:aspect-auto sm:h-[200px]">
      <div class="absolute inset-0 bg-[var(--bg-surface-active)] opacity-60" />
      
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative">
          <div class="animate-ping absolute -inset-1 rounded-full bg-primary-400 opacity-30"></div>
          <Icon name="i-ph-map-pin-fill" class="relative h-10 w-10 text-[var(--text-primary)] drop-shadow-lg" />
        </div>
      </div>

      <div class="absolute bottom-3 left-1/2 -translate-x-1/2">
        <UBadge color="neutral" variant="solid" size="xs" class="rounded-full shadow-[var(--shadow-sm)] font-bold px-3 text-[var(--text-primary)] border border-[var(--border-light)] bg-[var(--bg-surface)]">
          Google Maps
        </UBadge>
      </div>

      <div class="absolute left-3 top-3 flex flex-col items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] backdrop-blur-md shadow-[var(--shadow-lg)] border border-[var(--border-light)]">
        <UButton color="gray" variant="ghost" icon="i-ph-plus-bold" size="xs" class="rounded-lg h-8 w-8" />
        <div class="w-4 h-px bg-[var(--border-light)]" />
        <UButton color="gray" variant="ghost" icon="i-ph-minus-bold" size="xs" class="rounded-lg h-8 w-8" />
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
