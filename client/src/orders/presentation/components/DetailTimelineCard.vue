<!-- English description: Renders the order status timeline. -->
<template>
  <section class="surface-card group space-y-8 border border-[var(--border-light)] p-6 shadow-[var(--shadow-xl)] transition-all duration-500 sm:p-8">
    <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
      {{ $t("orders.card.orderProgress") }}
    </p>

    <div class="space-y-6">
      <div
        v-for="event in events"
        :key="event.key"
        class="group/event flex items-start gap-4 relative"
      >
        <!-- Timeline Link Line -->
        <div 
          v-if="events.indexOf(event) !== events.length - 1"
          class="absolute bottom-0 left-4 top-8 w-px bg-[var(--border-light)] transition-colors group-hover/event:bg-[var(--border-strong)]"
          :class="{ 'bg-[color-mix(in_srgb,var(--bg-brand)_30%,transparent)]': event.done }"
        />

        <!-- Marker -->
        <div
          class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-500"
          :class="event.done ? 'bg-[var(--bg-brand)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] ring-1 ring-[var(--border-strong)]' : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] ring-1 ring-[var(--border-light)] group-hover/event:bg-[var(--bg-surface-hover)]'"
        >
          <Icon :name="event.done ? 'i-ph-check-bold' : 'i-ph-clock-duotone'" class="h-4 w-4" />
        </div>

        <!-- Content Card -->
        <div class="surface-card min-w-0 flex-1 border border-[var(--border-light)] p-5 transition-all duration-300 group-hover/event:border-[var(--border-strong)]" :class="event.done ? 'bg-[var(--bg-surface-active)]' : 'bg-[var(--bg-surface)]'">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-[15px] font-black text-[var(--text-primary)] transition-colors group-hover/event:text-[var(--text-primary)]">
              {{ $t(event.label) }}
            </p>
            <UBadge v-if="event.time" variant="soft" color="neutral" class="rounded-lg bg-[var(--bg-muted)] ring-1 ring-[var(--border-light)] font-black text-[10px] px-2.5 py-1 text-[var(--text-secondary)]">
              {{ $t(event.time) }}
            </UBadge>
          </div>

          <p class="mt-3 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
            {{ $t(event.description) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { OrderTimelineEntry } from "../../domain/types/orders.types"

defineProps<{
  events: OrderTimelineEntry[]
}>()
</script>
