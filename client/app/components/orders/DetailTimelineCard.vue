<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
    <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
      {{ $t("orders.card.orderProgress") }}
    </p>

    <div class="mt-5 space-y-4">
      <div
        v-for="event in events"
        :key="event.key"
        class="flex items-start gap-3"
      >
        <div
          class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          :class="event.done ? 'bg-[#0000ff] text-white' : 'bg-[#eef2f8] text-slate-400'"
        >
          <Icon :name="event.done ? 'i-ph-check-bold' : 'i-ph-dot-outline'" class="h-4 w-4" />
        </div>

        <div class="min-w-0 flex-1 rounded-[18px] border p-3.5" :class="event.done ? 'border-[#d7e3ff] bg-[#f8fbff]' : 'border-[#eef2f8] bg-white'">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-[14px] font-black text-[#243b63]">
              {{ $t(event.label) }}
            </p>
            <p class="text-[12px] font-semibold text-slate-400">
              {{ $t(event.time) }}
            </p>
          </div>

          <p class="mt-2 text-[13px] leading-6 text-slate-500">
            {{ $t(event.description) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { OrderTimelineEntry } from "../../../types/orders"

defineProps<{
  events: OrderTimelineEntry[]
}>()
</script>
