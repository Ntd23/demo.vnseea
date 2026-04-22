<template>
  <UCard class="rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]" :ui="{ body: 'p-5' }">
    <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
      {{ title }}
    </p>
    <div class="mt-4 space-y-3">
      <UCard
        v-for="tip in items"
        :key="tip.title"
        class="rounded-[18px] border border-[#dbe3f2] bg-[#f8fbff]"
        :ui="{ body: 'p-4' }"
      >
        <div class="flex items-center gap-2">
          <UBadge color="primary" variant="subtle" class="rounded-full p-1.5">
            <Icon :name="tip.icon" class="h-4 w-4 text-[#0000ff]" />
          </UBadge>
          <p class="text-[13px] font-semibold text-[#243b63]">{{ tip.title }}</p>
        </div>
        <p class="mt-2 text-[12px] leading-6 text-slate-500">
          {{ tip.description }}
        </p>
      </UCard>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductTipItem } from "../../../types/product-editor"

defineProps<{
  title: string
  items: ProductTipItem[]
}>()
</script>
