<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      :eyebrow="$t('orders.page.detailEyebrow')"
      :title="pageTitle"
      :description="$t('orders.page.detailDescription')"
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
                    {{ $t(statusMeta.label) }}
                  </span>
                </div>

                <h2 class="mt-2 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
                  {{ $t("orders.card.orderedFrom", { seller: order.seller, price: formatOrderCurrency(order.total) }).split(' • ')[0] }}
                </h2>
                <p class="mt-2 max-w-[700px] text-[14px] leading-7 text-slate-500">
                  {{ $t(statusMeta.description) }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <div class="rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                  {{ order.placedAt }}
                </div>
                <div class="rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                  {{ $t("orders.card.items", { count: totalItems }) }}
                </div>
              </div>
            </div>

            <div class="mt-5 grid gap-3 md:grid-cols-3">
              <div class="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("orders.detail.recipient") }}
                </p>
                <p class="mt-2 text-[15px] font-black text-[#243b63]">
                  {{ order.recipientName }}
                </p>
                <p class="mt-1 text-[13px] text-slate-500">
                  {{ order.recipientPhone }}
                </p>
              </div>

              <div class="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("orders.detail.shippingProvider") }}
                </p>
                <p class="mt-2 text-[15px] font-black text-[#243b63]">
                  {{ order.shippingProvider }}
                </p>
                <p class="mt-2 text-[12px] text-slate-500">
                  {{ $t("orders.detail.trackingCodeLabel", { code: $t(order.trackingCode) }) }}
                </p>
              </div>

              <div class="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("orders.detail.estimatedProcess") }}
                </p>
                <p class="mt-2 text-[15px] font-black text-[#243b63]">
                  {{ $t(order.deliveryWindow) }}
                </p>
                <p class="mt-1 text-[13px] text-slate-500">
                  {{ $t(order.paymentMethod) }}
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-[30px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                  {{ $t("orders.card.productsInOrder") }}
                </p>
                <h2 class="mt-1 text-[1.3rem] font-black tracking-[-0.04em] text-[#243b63]">
                  {{ $t("orders.card.productsSummary", { count: totalItems }) }}
                </h2>
              </div>

              <div class="rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                {{ $t("orders.card.total", { total: formatOrderCurrency(order.total) }) }}
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <OrdersOrderItemCard
                v-for="item in order.items"
                :key="item.id"
                :item="item"
                :seller="order.seller"
                :payment-method="order.paymentMethod"
                variant="detail"
              />
            </div>
          </section>

          <div class="grid gap-5 xl:grid-cols-2">
            <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
              <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                {{ $t("orders.detail.deliveryAndNotes") }}
              </p>

              <div class="mt-5 grid gap-4">
                <div class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {{ $t("orders.card.shippingAddress") }}
                  </p>
                  <p class="mt-2 text-[14px] leading-7 text-slate-600">
                    {{ order.shippingAddress }}
                  </p>
                </div>

                <div class="rounded-[22px] border border-[#eef2f8] bg-[#fbfcff] p-4">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {{ $t("orders.detail.orderNote") }}
                  </p>
                  <p class="mt-2 text-[14px] leading-7 text-slate-600">
                    {{ order.note || $t("orders.detail.noNote") }}
                  </p>
                </div>
              </div>
            </section>

            <OrdersDetailTimelineCard :events="order.timeline" />
          </div>
        </div>

        <FoundationEmptyState
          v-else
          icon="i-ph-package-fill"
          :title="$t('orders.detail.notFound')"
          :description="$t('orders.detail.notFoundDesc')"
        />
      </template>

      <template #right>
        <OrdersDetailSidebar
          v-if="order"
          :order="order"
        />

        <section
          v-else
          class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]"
        >
          <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
            {{ $t("orders.sidebar.tasks") }}
          </p>
          <p class="mt-3 text-[14px] leading-7 text-slate-500">
            {{ $t("orders.sidebar.tasksAction") }}
          </p>
          <NuxtLink
            to="/orders"
            class="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#243b63] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(36,59,99,0.18)] transition hover:-translate-y-0.5"
          >
            {{ $t("orders.sidebar.backToOrders") }}
          </NuxtLink>
        </section>
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import CheckoutLayout from "../checkout/CheckoutLayout.vue"
import {
  useOrderPresentation,
} from "../../composables/useOrderPresentation"
import { formatOrderCurrency } from "../../../types/orders"

const props = defineProps<{
  orderId: string
}>()

const { findOrderById } = useBuyerOrders()

const order = computed(() => findOrderById(props.orderId))
const { statusMeta, totalItems } = useOrderPresentation(order)

const { t } = useI18n()

const pageTitle = computed(() =>
  order.value
    ? t("orders.page.detailTitle", { id: order.value.orderNumber })
    : t("orders.page.detailFallbackTitle"),
)
</script>
