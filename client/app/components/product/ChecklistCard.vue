<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
    <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
      {{ title || $t("pages.productEditor.checklist") }}
    </p>
    <div class="mt-4 space-y-3">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-start gap-3 rounded-[18px] border px-3.5 py-3"
        :class="item.done ? 'border-[#b8f0c9] bg-[#f2fcf5]' : 'border-[#dbe3f2] bg-[#f8fbff]'"
      >
        <div
          class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          :class="item.done ? 'bg-[#16a34a] text-white' : 'border border-[#dbe3f2] bg-white text-slate-300'"
        >
          <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-dot-outline'" class="h-3.5 w-3.5" />
        </div>
        <div>
          <p class="text-[13px] font-semibold text-[#243b63]">{{ item.label }}</p>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductChecklistItem } from "~/types/product-editor"

withDefaults(defineProps<{
  title?: string
  items: ProductChecklistItem[]
}>(), {
  title: undefined,
})
</script>
