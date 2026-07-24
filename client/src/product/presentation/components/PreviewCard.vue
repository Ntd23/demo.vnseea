<!-- English description: Renders the live product form preview. -->
<template>
  <UCard 
    class="surface-card group overflow-hidden ring-1 ring-[var(--border-light)] hover:ring-primary-400/50 transition-all duration-500 hover:shadow-[var(--shadow-xl)] hover:-translate-y-3 bg-[var(--bg-surface)]"
    :ui="{ body: { padding: 'p-0' }, base: 'overflow-hidden' }"
  >
    <!-- Media Preview Layer -->
    <div class="relative h-[280px] overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute inset-0 transition-transform duration-1000 group-hover:scale-110" :style="{ background: previewBackground }" />
      <div class="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg-media)_80%,transparent),transparent)] opacity-60" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--text-media)_20%,transparent),transparent_50%)]" />
      
      <!-- Duotone Icon Deco -->
      <div class="absolute right-[-10%] top-8 h-48 w-48 text-[color-mix(in_srgb,var(--text-media)_5%,transparent)] transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 group-hover:text-[color-mix(in_srgb,var(--text-media)_10%,transparent)] pointer-events-none">
        <Icon :name="previewIcon + '-duotone'" class="h-full w-full" />
      </div>

      <!-- Badges -->
      <div class="absolute left-6 top-6 flex flex-wrap gap-3">
        <div class="rounded-xl border border-[var(--border-media)] bg-[color-mix(in_srgb,var(--bg-media)_60%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-media)] shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {{ categoryLabel }}
        </div>
        <div class="rounded-xl border border-[var(--border-media)] bg-[color-mix(in_srgb,var(--text-media)_10%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-media)] shadow-[var(--shadow-lg)] backdrop-blur-xl transition-colors group-hover:bg-[color-mix(in_srgb,var(--bg-brand)_30%,transparent)]">
          {{ conditionLabel }}
        </div>
      </div>

      <!-- Location Info -->
      <div class="absolute bottom-6 left-6 flex items-center gap-3">
        <div class="flex items-center gap-2.5 rounded-xl border border-[var(--border-media)] bg-[color-mix(in_srgb,var(--bg-media)_40%,transparent)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-media)] shadow-[var(--shadow-lg)] backdrop-blur-xl">
          <Icon name="i-ph-map-pin-duotone" class="h-4 w-4 text-[var(--color-success)]" />
          {{ location || locationPlaceholder || $t("pages.productEditor.previewLocationPlaceholder") }}
        </div>
        <div class="rounded-xl border border-[var(--border-media)] bg-[color-mix(in_srgb,var(--text-media)_20%,transparent)] px-4 py-2.5 text-[10px] font-semibold text-[var(--text-media)] shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {{ $t("pages.productEditor.imageCount", { count: imageCount }) }}
        </div>
      </div>
    </div>

    <!-- Content Details Layer -->
    <div class="relative p-8 space-y-6">
      <!-- Preview Action Icons (Mock) -->
      <div class="absolute -top-10 right-8 flex items-center gap-4">
        <div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-lg)] ring-1 ring-[var(--border-light)] transition-all hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-brand)] active:scale-90 border-none">
          <Icon :name="leadingIcon + '-duotone'" class="h-7 w-7" />
        </div>
        <div class="h-14 w-14 flex items-center justify-center rounded-2xl bg-[var(--bg-brand)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] active:scale-90 transition-all border-none">
          <Icon :name="trailingIcon + '-duotone'" class="h-8 w-8" />
        </div>
      </div>

      <div class="space-y-2">
        <p class="pl-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)] transition-colors group-hover:text-[var(--text-primary)]">
          {{ currencyLabel }}
        </p>
        <h3 class="pr-20 text-2xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] transition-colors line-clamp-1 group-hover:text-[var(--text-brand)]">
          {{ title || emptyTitle }}
        </h3>
      </div>

      <p class="text-sm font-medium leading-relaxed text-[var(--text-primary)] line-clamp-2 min-h-[2.5rem] italic pr-4">
        "{{ description }}"
      </p>

      <div class="flex items-center justify-between gap-4 pt-6 border-t border-[var(--border-light)] transition-colors">
        <div class="space-y-1">
          <p class="pl-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] leading-none text-[var(--text-tertiary)]">{{ $t("pages.productEditor.priceLabel") }}</p>
          <p class="pt-1 text-2xl font-extrabold leading-none tracking-tight text-[var(--text-brand)]">
            {{ price }}
          </p>
        </div>

        <div class="flex flex-col items-end gap-2 text-right">
          <div class="inline-flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-success)] ring-1 ring-[var(--border-light)] shadow-[var(--shadow-sm)]">
            <Icon name="i-ph-check-circle-duotone" class="h-4 w-4" />
            {{ statusLabel }}
          </div>
          <p class="pr-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
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
