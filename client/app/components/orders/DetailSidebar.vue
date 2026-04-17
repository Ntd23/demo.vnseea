<template>
  <div class="space-y-5">
    <section class="rounded-[28px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf7_100%)] p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
        Tổng đơn hàng
      </p>

      <OrdersOrderPriceSummary :order="order" class="mt-4" />

      <div class="mt-4 grid gap-3">
        <div class="rounded-[18px] border border-[#eef2f8] bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Thanh toán
          </p>
          <p class="mt-2 text-[14px] font-black text-[#243b63]">
            {{ order.paymentMethod }}
          </p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold"
              :class="paymentMeta.badgeClass"
            >
              {{ paymentMeta.label }}
            </span>
            <span class="text-[12px] text-slate-500">
              {{ order.paymentReference }}
            </span>
          </div>
        </div>

        <div class="rounded-[18px] border border-[#eef2f8] bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Vận chuyển
          </p>
          <p class="mt-2 text-[14px] font-black text-[#243b63]">
            {{ order.shippingProvider }}
          </p>
          <p class="mt-2 text-[12px] text-slate-500">
            Mã theo dõi: {{ order.trackingCode }}
          </p>
        </div>

        <div
          class="rounded-[18px] px-4 py-3 text-[13px] leading-6"
          :class="statusMeta.panelClass"
        >
          {{ statusMeta.description }}
        </div>
      </div>
    </section>

    <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
        Tác vụ nhanh
      </p>

      <div class="mt-4 grid gap-3">
        <NuxtLink
          to="/orders"
          class="inline-flex h-11 items-center justify-center rounded-full bg-[#243b63] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(36,59,99,0.18)] transition hover:-translate-y-0.5"
        >
          Quay lại danh sách đơn
        </NuxtLink>

        <button
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-5 text-[14px] font-semibold text-slate-600 transition hover:border-[#c5caff] hover:text-[#243b63]"
          type="button"
        >
          Liên hệ {{ order.seller }}
        </button>

        <NuxtLink
          to="/products"
          class="inline-flex h-11 items-center justify-center rounded-full bg-[#9ad89f] px-5 text-[14px] font-extrabold text-[#1f4d26] shadow-[0_10px_22px_rgba(154,216,159,0.22)] transition hover:-translate-y-0.5"
        >
          Tiếp tục mua sắm
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  useOrderPresentation,
} from "../../composables/useOrderPresentation"
import type { BuyerOrder } from "../../../types/orders"

const props = defineProps<{
  order: BuyerOrder
}>()

const { paymentMeta, statusMeta } = useOrderPresentation(computed(() => props.order))
</script>
