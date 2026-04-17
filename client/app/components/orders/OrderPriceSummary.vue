<template>
  <div :class="cardClass">
    <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
      Tổng thanh toán
    </p>

    <div class="mt-4 space-y-3 text-[13px] text-slate-500">
      <div class="flex items-center justify-between gap-3">
        <span>Tạm tính</span>
        <span class="font-semibold text-[#243b63]">{{ formatOrderCurrency(subtotal) }}</span>
      </div>
      <div class="flex items-center justify-between gap-3">
        <span>Phí giao hàng</span>
        <span class="font-semibold text-[#243b63]">
          {{ order.shippingFee > 0 ? formatOrderCurrency(order.shippingFee) : "Miễn phí" }}
        </span>
      </div>
    </div>

    <div class="mt-4 h-px bg-[#e8edf7]" />

    <div class="mt-4 flex items-end justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Tổng đơn
        </p>
        <p class="mt-1 text-[1.7rem] font-black tracking-[-0.05em] text-[#2f3542]">
          {{ formatOrderCurrency(order.total) }}
        </p>
      </div>

      <div
        v-if="statusMeta"
        :class="statusMeta.panelClass"
        class="rounded-full px-3 py-1.5 text-[11px] font-bold"
      >
        {{ statusMeta.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderPresentation } from "../../composables/useOrderPresentation"
import { formatOrderCurrency } from "../../../types/orders"
import type { BuyerOrder } from "../../../types/orders"

const props = withDefaults(defineProps<{
  order: BuyerOrder
  cardClass?: string
}>(), {
  cardClass: "rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_8px_18px_rgba(15,35,110,0.04)]",
})

const { subtotal, statusMeta } = useOrderPresentation(computed(() => props.order))
</script>
