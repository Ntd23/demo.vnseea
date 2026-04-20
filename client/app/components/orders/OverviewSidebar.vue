<template>
  <div class="space-y-5">
    <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
        {{ $t("orders.sidebar.overview") }}
      </p>

      <div class="mt-4 grid gap-3">
        <div
          v-for="card in cards"
          :key="card.label"
          class="rounded-[20px] border p-4"
          :class="toneClassMap[card.tone]"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                {{ $t(card.label) }}
              </p>
              <p class="mt-2 text-[1.7rem] font-black leading-none">
                {{ card.value }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/80 shadow-[0_8px_18px_rgba(15,35,110,0.05)]">
              <Icon :name="card.icon" class="h-5 w-5" />
            </div>
          </div>

          <p class="mt-3 text-[13px] leading-6 opacity-80">
            {{ $t(card.description) }}
          </p>
        </div>
      </div>
    </section>

    <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
        {{ $t("orders.sidebar.trackRecent") }}
      </p>

      <template v-if="nextOrder">
        <div class="mt-4 rounded-[22px] border border-[#eef2f8] bg-[#f8fbff] p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-[14px] font-black text-[#243b63]">
              {{ nextOrder.orderNumber }}
            </p>
            <span
              class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold"
              :class="nextStatusMeta.badgeClass"
            >
              <Icon :name="nextStatusMeta.icon" class="h-3.5 w-3.5" />
              {{ $t(nextStatusMeta.label) }}
            </span>
          </div>

          <p class="mt-3 text-[14px] font-semibold text-slate-600">
            {{ nextOrder.seller }}
          </p>
          <p class="mt-2 text-[13px] leading-6 text-slate-500">
            {{ $t(nextOrder.deliveryWindow) }}
          </p>

          <NuxtLink
            :to="`/order/${nextOrder.id}`"
            class="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#243b63] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(36,59,99,0.18)] transition hover:-translate-y-0.5"
          >
            {{ $t("orders.sidebar.viewStatus") }}
          </NuxtLink>
        </div>
      </template>

      <div v-else class="mt-4 rounded-[22px] border border-dashed border-[#dbe3f2] bg-[#f8fbff] px-4 py-6 text-center">
        <p class="text-[14px] font-semibold text-slate-500">
          {{ $t("orders.sidebar.noRecent") }}
        </p>
      </div>
    </section>

    <section class="rounded-[28px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf7_100%)] p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
        {{ $t("orders.sidebar.currentFilter") }}
      </p>
      <div class="mt-4 rounded-[20px] bg-white/80 px-4 py-4 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
        <p class="text-[14px] font-black text-[#243b63]">
          {{ $t(activeFilterLabel) }}
        </p>
        <p class="mt-2 text-[13px] leading-6 text-slate-500">
          {{ $t("orders.sidebar.filterHint", { count: visibleCount }) }}
        </p>
      </div>

      <div class="mt-4 space-y-3 text-[13px] leading-6 text-slate-500">
        <div class="rounded-[18px] bg-white/80 px-4 py-3 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
          {{ $t("orders.sidebar.flowHintReal") }}
        </div>
        <div class="rounded-[18px] bg-white/80 px-4 py-3 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
          {{ $t("orders.sidebar.flowHintMarketplace") }}
        </div>
      </div>

      <NuxtLink
        to="/products"
        class="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#9ad89f] px-5 text-[14px] font-extrabold text-[#1f4d26] shadow-[0_10px_22px_rgba(154,216,159,0.22)] transition hover:-translate-y-0.5"
      >
        {{ $t("orders.sidebar.continueShopping") }}
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { buyerOrderStatusMeta } from "../../../types/orders"
import type { BuyerOrder, OrdersOverviewCard } from "../../../types/orders"

const props = defineProps<{
  cards: OrdersOverviewCard[]
  nextOrder: BuyerOrder | null
  activeFilterLabel: string
  visibleCount: number
}>()

const toneClassMap = {
  amber: "border-[#fde7b2] bg-[#fff8ea] text-[#9a5b00]",
  blue: "border-[#cfe0ff] bg-[#eef4ff] text-[#1d4ed8]",
  green: "border-[#c7ebd0] bg-[#effaf3] text-[#1f7a38]",
  rose: "border-[#fecdd3] bg-[#fff1f3] text-[#be123c]",
} as const

const nextStatusMeta = computed(() =>
  props.nextOrder ? buyerOrderStatusMeta[props.nextOrder.status] : null,
)
</script>
