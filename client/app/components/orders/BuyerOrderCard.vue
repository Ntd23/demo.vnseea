<template>
  <article class="rounded-[30px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-[12px] font-bold uppercase tracking-[0.24em] text-[#0000ff]/70">
            {{ order.orderNumber }}
          </p>
          <span
            class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold"
            :class="statusMeta.badgeClass"
          >
            <Icon :name="statusMeta.icon" class="h-3.5 w-3.5" />
            {{ statusMeta.label }}
          </span>
        </div>

        <h3 class="mt-2 text-[1.4rem] font-black tracking-[-0.05em] text-[#243b63]">
          {{ order.seller }}
        </h3>
        <p class="mt-2 max-w-[640px] text-[14px] leading-6 text-slate-500">
          {{ statusMeta.description }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 text-[12px] font-semibold text-slate-500">
        <div class="rounded-full bg-[#f7f9ff] px-3 py-2">
          {{ order.placedAt }}
        </div>
        <div class="rounded-full bg-[#f7f9ff] px-3 py-2">
          {{ totalItems }} sản phẩm
        </div>
        <div class="rounded-full bg-[#f7f9ff] px-3 py-2">
          {{ order.paymentMethod }}
        </div>
      </div>
    </div>

    <div class="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div class="space-y-3">
        <section class="rounded-[24px] border border-[#eef2f8] bg-[#fbfcff] p-4">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Sản phẩm trong đơn
            </p>
            <p class="text-[12px] font-semibold text-slate-500">
              {{ order.deliveryWindow }}
            </p>
          </div>

          <div class="mt-4 space-y-3">
            <OrdersOrderItemCard
              v-for="item in order.items"
              :key="item.id"
              :item="item"
            />
          </div>
        </section>

        <section class="rounded-[24px] border border-[#eef2f8] bg-[#fbfcff] p-4">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Địa chỉ giao hàng
          </p>
          <p class="mt-3 text-[14px] leading-7 text-slate-600">
            {{ order.shippingAddress }}
          </p>
        </section>
      </div>

      <aside class="space-y-3">
        <OrdersOrderPriceSummary
          :order="order"
          card-class="rounded-[24px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4"
        />

        <section class="rounded-[24px] border border-[#eef2f8] bg-white p-4">
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Tiến trình đơn hàng
          </p>

          <div class="mt-4 grid gap-3">
            <div
              v-for="(step, index) in progressSteps"
              :key="step.label"
              class="flex items-start gap-3"
            >
              <div
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                :class="index <= activeProgressStep ? 'bg-[#0000ff] text-white' : 'bg-[#eef2f8] text-slate-400'"
              >
                {{ index + 1 }}
              </div>
              <div>
                <p class="text-[13px] font-semibold text-[#243b63]">{{ step.label }}</p>
                <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <div class="mt-5 flex flex-wrap gap-3">
      <NuxtLink
        :to="`/order/${order.id}`"
        class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,255,0.18)] transition hover:-translate-y-0.5"
      >
        Xem chi tiết đơn
      </NuxtLink>

      <button
        class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-5 text-[14px] font-semibold text-slate-600 transition hover:border-[#c5caff] hover:text-[#243b63]"
        type="button"
      >
        Liên hệ shop
      </button>

      <NuxtLink
        to="/products"
        class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f7f9ff] px-5 text-[14px] font-semibold text-[#243b63] transition hover:border-[#c5caff]"
      >
        {{ repeatActionLabel }}
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  getRepeatOrderActionLabel,
  useOrderPresentation,
} from "../../composables/useOrderPresentation"
import type { BuyerOrder } from "../../../types/orders"

const props = defineProps<{
  order: BuyerOrder
}>()

const { statusMeta, totalItems, activeProgressStep } = useOrderPresentation(computed(() => props.order))

const progressSteps = [
  {
    label: "Đã đặt hàng",
    description: "Đơn đã được ghi nhận vào hệ thống mua hàng.",
  },
  {
    label: "Shop xử lý",
    description: "Người bán chuẩn bị và xác nhận đơn của bạn.",
  },
  {
    label: "Đang giao",
    description: "Đơn hàng đã bàn giao cho đơn vị vận chuyển.",
  },
  {
    label: "Hoàn tất",
    description: "Bạn đã nhận hàng và đơn được đóng thành công.",
  },
] as const

const repeatActionLabel = computed(() => getRepeatOrderActionLabel(props.order.status))
</script>
