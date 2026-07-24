<!-- English description: Renders order search and status filters. -->
<template>
  <section class="surface-card group space-y-8 border border-[var(--border-light)] p-6 shadow-[var(--shadow-xl)] sm:p-8">
    <div class="flex flex-col gap-6 border-b border-[var(--border-light)] pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
          {{ $t("orders.filter.title") }}
        </p>
        <h2 class="text-2xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
          {{ $t("orders.filter.matched", { count: visibleCount }) }}
        </h2>
        <p class="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
          {{ $t("orders.filter.current", { label: $t(activeFilterLabel) }) }}
        </p>
      </div>

      <div class="w-full lg:max-w-[340px]">
        <UInput
          v-model="searchModel"
          icon="i-ph-magnifying-glass-duotone"
          size="xl"
          :placeholder="$t('orders.filter.placeholder')"
          :ui="{ 
            rounded: 'rounded-2xl', 
            size: { xl: 'h-[56px] px-6 text-base' }, 
            base: 'bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] focus:bg-[var(--bg-surface)] ring-1 ring-[var(--border-light)] focus:ring-[var(--border-strong)] transition-all duration-300'
          }"
        />
      </div>
    </div>

    <!-- Filter Buttons Grid -->
    <div class="flex flex-wrap gap-2.5">
      <UButton
        v-for="filter in filters"
        :key="filter.key"
        variant="soft"
        size="md"
        class="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 py-2.5 transition-all active:scale-95 border"
        :class="activeFilterModel === filter.key
          ? 'border-[var(--border-strong)] bg-[var(--bg-brand)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)]'
          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'"
        @click="activeFilterModel = filter.key"
      >
        <span>{{ $t(filter.label) }}</span>
        <UBadge
          variant="soft"
          :color="activeFilterModel === filter.key ? 'white' : 'primary'"
          class="rounded-lg font-black text-[9px] min-w-[20px] justify-center transition-colors px-1.5 py-0.5"
          :class="activeFilterModel === filter.key ? 'bg-[color-mix(in_srgb,var(--text-inverse)_20%,transparent)] text-[var(--text-inverse)]' : 'bg-[var(--bg-surface-active)] text-[var(--text-primary)]'"
        >
          {{ filter.count }}
        </UBadge>
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuyerOrderFilter, OrdersFilterOption } from "../../domain/types/orders.types"

defineProps<{
  filters: OrdersFilterOption[]
  visibleCount: number
  activeFilterLabel: string
}>()

const searchModel = defineModel<string>("search", { required: true })
const activeFilterModel = defineModel<BuyerOrderFilter>("activeFilter", { required: true })
</script>
