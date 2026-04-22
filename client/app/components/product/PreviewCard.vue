<template>
  <UCard class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]" :ui="{ body: 'p-0' }">
    <div class="relative h-[250px] overflow-hidden">
      <div class="absolute inset-0" :style="{ background: previewBackground }" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_30%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.18)_100%)]" />
      <Icon :name="previewIcon" class="absolute right-5 top-5 h-24 w-24 text-white/18" />

      <div class="absolute left-4 top-4 flex gap-2">
        <span class="rounded-[10px] bg-[#101828]/80 px-2.5 py-1 text-[11px] font-bold text-white">
          {{ categoryLabel }}
        </span>
        <span class="rounded-[10px] bg-white/16 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-[4px]">
          {{ conditionLabel }}
        </span>
      </div>

      <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div class="rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-[4px]">
          {{ location || locationPlaceholder || $t("pages.productEditor.previewLocationPlaceholder") }}
        </div>
        <div class="rounded-full bg-white/18 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-[4px]">
          {{ $t("pages.productEditor.imageCount", { count: imageCount }) }}
        </div>
      </div>
    </div>

    <div class="relative p-4">
      <div class="absolute -top-6 right-4 flex items-center gap-2">
        <div class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f7ff] text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.12)]">
          <Icon :name="leadingIcon" class="h-5 w-5" />
        </div>
        <div class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0000ff] text-white shadow-[0_10px_22px_rgba(0,0,255,0.24)]">
          <Icon :name="trailingIcon" class="h-5 w-5" />
        </div>
      </div>

      <p class="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {{ currencyLabel }}
      </p>
      <h3 class="mt-2 pr-24 text-[1.28rem] font-black leading-[1.1] tracking-[-0.05em] text-[#243b63]">
        {{ title || emptyTitle }}
      </h3>

      <p class="mt-3 min-h-[72px] text-[13px] leading-6 text-slate-500">
        {{ description }}
      </p>

      <div class="mt-4 flex items-end justify-between gap-3">
        <div>
          <p class="text-[12px] font-semibold text-slate-400">{{ $t("pages.productEditor.priceLabel") }}</p>
          <p class="text-[1.2rem] font-black text-[#16a34a]">
            {{ price }}
          </p>
        </div>

        <div class="text-right">
          <div class="inline-flex items-center gap-1 rounded-full bg-[#effaf3] px-2.5 py-1 text-[11px] font-bold text-[#16a34a]">
            <Icon name="i-ph-check-circle-fill" class="h-3.5 w-3.5" />
            {{ statusLabel }}
          </div>
          <p class="mt-2 text-[12px] font-medium text-slate-400">
            {{ stockLabel }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  previewBackground: string
  previewIcon: string
  categoryLabel: string
  conditionLabel: string
  currencyLabel: string
  title: string
  emptyTitle: string
  description: string
  price: string
  stockLabel: string
  location: string
  imageCount: number
  leadingIcon: string
  trailingIcon: string
  statusLabel: string
  locationPlaceholder?: string
}>(), {
  locationPlaceholder: undefined,
})
</script>
