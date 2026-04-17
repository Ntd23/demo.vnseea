<template>
  <article
    v-if="variant === 'detail'"
    class="grid gap-4 rounded-[24px] border border-[#eef2f8] bg-[#fbfcff] p-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-start"
  >
    <div class="relative mx-auto h-[180px] w-full max-w-[280px] overflow-hidden rounded-[20px] border border-[#dbe3f2] bg-[#eef1f7] md:mx-0 md:h-[120px] md:w-[120px] md:max-w-none">
      <div class="absolute inset-0" :style="{ background: item.imageStyle || orderItemFallbackBackground }" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.12)_100%)]" />
      <div class="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-[4px]">
        Item
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="text-[16px] font-black text-[#243b63]">
            {{ item.name }}
          </p>
          <p class="mt-1 text-[13px] leading-6 text-slate-500">
            {{ detailMetaText }}
          </p>
        </div>

        <p class="text-[15px] font-black text-[#16a34a]">
          {{ formatOrderCurrency(item.price * item.quantity) }}
        </p>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <div class="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500">
          Số lượng {{ item.quantity }}
        </div>
        <div
          v-if="paymentMethod"
          class="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500"
        >
          {{ paymentMethod }}
        </div>
      </div>
    </div>
  </article>

  <div
    v-else
    class="flex gap-3 rounded-[20px] border border-[#e8edf7] bg-white p-3 shadow-[0_8px_20px_rgba(15,35,110,0.04)]"
  >
    <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] border border-[#dbe3f2] bg-[#eef1f7]">
      <div
        class="absolute inset-0"
        :style="{ background: item.imageStyle || orderItemFallbackBackground }"
      />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.12)_100%)]" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-[15px] font-black text-[#243b63]">
            {{ item.name }}
          </p>
          <p class="mt-1 text-[13px] text-slate-500">
            Qty {{ item.quantity }}
          </p>
        </div>

        <p class="text-[14px] font-black text-[#16a34a]">
          {{ formatOrderCurrency(item.price * item.quantity) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { orderItemFallbackBackground } from "../../composables/useOrderPresentation"
import { formatOrderCurrency } from "../../../types/orders"
import type { OrderItem } from "../../../types/orders"

const props = withDefaults(defineProps<{
  item: OrderItem
  seller?: string
  paymentMethod?: string
  metaText?: string
  variant?: "compact" | "detail"
}>(), {
  seller: "",
  paymentMethod: "",
  metaText: "",
  variant: "compact",
})

const detailMetaText = computed(() =>
  props.metaText
    || (props.seller
      ? `Đặt từ shop ${props.seller} • Đơn giá ${formatOrderCurrency(props.item.price)}`
      : `Đơn giá ${formatOrderCurrency(props.item.price)}`),
)
</script>
