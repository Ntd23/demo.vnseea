<!-- English description: Renders product publishing tips. -->
<template>
  <UCard 
    class="surface-card group ring-1 ring-[var(--border-light)] shadow-2xl bg-[var(--bg-surface)] transition-all duration-500 hover:shadow-3xl"
    :ui="{ body: { padding: 'p-8 sm:p-10' } }"
  >
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">
          {{ title }}
        </p>
        <Icon name="i-ph-lightbulb-duotone" class="h-6 w-6 text-primary-300" />
      </div>

      <div class="space-y-5">
        <div 
          v-for="(tip, index) in items" 
          :key="index" 
          class="flex items-start gap-4 group/tip"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-surface-active)] text-[var(--text-brand)] ring-1 ring-[var(--border-light)] transition-transform duration-500 group-hover/tip:scale-110">
            <Icon name="i-ph-info-duotone" class="h-5 w-5" />
          </div>
          <p class="text-[11px] font-medium leading-relaxed text-[var(--text-primary)] transition-colors group-hover/tip:text-[var(--text-brand)] pt-2.5">
            {{ tip.description }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductTipItem } from "../../domain/types/product-editor.types"

defineProps<{
  title: string
  items: ProductTipItem[]
}>()
</script>
