<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      eyebrow="P-17 · Đơn khách đặt"
      :title="pageTitle"
      description="Theo dõi một đơn bán cụ thể, kiểm tra thông tin người mua và chuẩn bị các bước cập nhật shipped/completed cho seller flow."
    >
      <template #left>
        <div v-if="order" class="space-y-5">
          <section class="rounded-[30px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
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
                  <span
                    class="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold"
                    :class="payoutMeta.badgeClass"
                  >
                    {{ payoutMeta.label }}
                  </span>
                </div>

                <h2 class="mt-2 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
                  Đơn từ khách {{ order.buyerName }}
                </h2>
                <p class="mt-2 max-w-[720px] text-[14px] leading-7 text-slate-500">
                  {{ statusMeta.description }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <div class="rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                  {{ order.placedAt }}
                </div>
                <div class="rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                  {{ totalItems }} sản phẩm
                </div>
                <div class="rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                  {{ order.storeName }}
                </div>
              </div>
            </div>

            <div class="mt-5 grid gap-3 md:grid-cols-3">
              <div class="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Người mua
                </p>
                <p class="mt-2 text-[15px] font-black text-[#243b63]">
                  {{ order.buyerName }}
                </p>
                <p class="mt-1 text-[13px] text-slate-500">
                  {{ order.buyerPhone }}
                </p>
              </div>

              <div class="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Đơn vị giao
                </p>
                <p class="mt-2 text-[15px] font-black text-[#243b63]">
                  {{ order.shippingProvider }}
                </p>
                <p class="mt-1 text-[13px] text-slate-500">
                  {{ order.trackingCode }}
                </p>
              </div>

              <div class="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Đối soát
                </p>
                <p class="mt-2 text-[15px] font-black text-[#243b63]">
                  {{ formatOrderCurrency(order.payoutAmount) }}
                </p>
                <p class="mt-1 text-[13px] text-slate-500">
                  {{ order.payoutWindow }}
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-[30px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                  Sản phẩm khách đã đặt
                </p>
                <h2 class="mt-1 text-[1.3rem] font-black tracking-[-0.05em] text-[#243b63]">
                  {{ totalItems }} sản phẩm cần xử lý
                </h2>
              </div>

              <div class="rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                Tổng đơn {{ formatOrderCurrency(order.total) }}
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <OrdersOrderItemCard
                v-for="item in order.items"
                :key="item.id"
                :item="item"
                :meta-text="`Thuộc gian hàng ${order.storeName} • Đơn giá ${formatOrderCurrency(item.price)}`"
                :payment-method="order.paymentMethod"
                variant="detail"
              />
            </div>
          </section>

          <div class="grid gap-5 xl:grid-cols-2">
            <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
              <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                Người mua & ghi chú
              </p>

              <div class="mt-5 grid gap-4">
                <div class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Địa chỉ giao hàng
                  </p>
                  <p class="mt-2 text-[14px] leading-7 text-slate-600">
                    {{ order.buyerAddress }}
                  </p>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <div class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                    <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Thanh toán
                    </p>
                    <p class="mt-2 text-[14px] font-black text-[#243b63]">
                      {{ order.paymentMethod }}
                    </p>
                    <p class="mt-2 text-[13px] text-slate-500">
                      {{ order.paymentReference }}
                    </p>
                    <span
                      class="mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold"
                      :class="paymentMeta.badgeClass"
                    >
                      {{ paymentMeta.label }}
                    </span>
                  </div>

                  <div class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                    <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Khung giao dự kiến
                    </p>
                    <p class="mt-2 text-[14px] font-black text-[#243b63]">
                      {{ order.deliveryWindow }}
                    </p>
                    <p class="mt-2 text-[13px] text-slate-500">
                      Người mua: {{ order.buyerPhone }}
                    </p>
                  </div>
                </div>

                <div class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Ghi chú từ khách
                  </p>
                  <p class="mt-2 text-[14px] leading-7 text-slate-600">
                    {{ order.buyerNote || "Khách không để lại ghi chú bổ sung." }}
                  </p>
                </div>

                <div class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Ghi chú nội bộ
                  </p>
                  <p class="mt-2 text-[14px] leading-7 text-slate-600">
                    {{ order.sellerNote || "Chưa có ghi chú nội bộ cho đơn này." }}
                  </p>
                </div>
              </div>
            </section>

            <OrdersSellerOrderChecklistCard :order="order" />
          </div>

          <OrdersDetailTimelineCard :events="order.timeline" />
        </div>

        <FoundationEmptyState
          v-else
          icon="i-ph-package-fill"
          title="Không tìm thấy đơn bán"
          description="Mã đơn này không tồn tại trong dữ liệu seller mock hiện tại. Hãy quay lại sản phẩm của bạn để mở một đơn khác."
        />
      </template>

      <template #right>
        <OrdersSellerOrderSidebar
          v-if="order"
          :order="order"
        />

        <section
          v-else
          class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]"
        >
          <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
            Tác vụ
          </p>
          <p class="mt-3 text-[14px] leading-7 text-slate-500">
            Quay lại khu vực người bán để mở đúng đơn khách đặt mà bạn muốn xử lý.
          </p>
          <NuxtLink
            to="/my-products"
            class="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#243b63] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(36,59,99,0.18)] transition hover:-translate-y-0.5"
          >
            Về sản phẩm của tôi
          </NuxtLink>
        </section>
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import CheckoutLayout from "../checkout/CheckoutLayout.vue"
import { useOrderPresentation } from "../../composables/useOrderPresentation"
import { useSellerOrders } from "../../composables/useSellerOrders"
import {
  formatOrderCurrency,
  sellerOrderPayoutStatusMeta,
} from "../../../types/orders"

const props = defineProps<{
  orderId: string
}>()

const { findOrderById } = useSellerOrders()

const order = computed(() => findOrderById(props.orderId))
const { paymentMeta, statusMeta, totalItems } = useOrderPresentation(order)

const payoutMeta = computed(() =>
  order.value
    ? sellerOrderPayoutStatusMeta[order.value.payoutStatus]
    : sellerOrderPayoutStatusMeta.queued,
)

const pageTitle = computed(() =>
  order.value ? `Đơn bán ${order.value.orderNumber}` : "Chi tiết đơn bán",
)
</script>
