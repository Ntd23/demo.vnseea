<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      :eyebrow="$t('orders.page.detailEyebrow')"
      :title="pageTitle"
      :description="$t('orders.page.detailDescription')"
    >
      <template #left>
        <div v-if="order" class="space-y-5">
          <section class="surface-card p-6 sm:p-8 space-y-8 ring-1 ring-secondary-100 shadow-xl transition-all duration-500">
            <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between border-b border-secondary-50 pb-6">
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-3">
                  <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
                    {{ order.orderNumber }}
                  </p>
                  <UBadge
                    v-if="statusMeta"
                    variant="soft"
                    class="rounded-lg font-black text-[10px] uppercase tracking-widest px-3 py-1 ring-1 ring-inset"
                    :class="statusMeta.badgeClass"
                  >
                    <template #leading>
                      <Icon :name="statusMeta.icon.includes('duotone') ? statusMeta.icon : statusMeta.icon.replace('-fill', '-duotone')" class="h-3.5 w-3.5 mr-1" />
                    </template>
                    {{ $t(statusMeta.label) }}
                  </UBadge>
                </div>

                <h2 class="text-2xl font-black tracking-tight text-secondary-900 leading-tight">
                  {{ $t("orders.card.orderedFrom", { seller: order.seller, price: formatOrderCurrency(order.total) }).split(' • ')[0] }}
                </h2>
                <p v-if="statusMeta" class="text-sm font-medium leading-relaxed text-secondary-500 max-w-2xl">
                  {{ $t(statusMeta.description) }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2 pt-2 xl:pt-1">
                <UBadge color="white" variant="soft" size="lg" class="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm">
                  {{ order.placedAt }}
                </UBadge>
                <UBadge color="white" variant="soft" size="lg" class="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm">
                  {{ $t("orders.card.items", { count: totalItems }) }}
                </UBadge>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div class="surface-card p-5 bg-secondary-50/50 ring-1 ring-secondary-100 space-y-4 group/info hover:bg-white transition-colors duration-500">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
                  {{ $t("orders.detail.recipient") }}
                </p>
                <div class="space-y-1">
                  <p class="text-sm font-black text-secondary-900 group-hover/info:text-secondary-900 transition-colors">
                    {{ order.recipientName }}
                  </p>
                  <p class="text-[11px] font-medium leading-relaxed text-secondary-500">
                    {{ order.recipientPhone }}
                  </p>
                </div>
              </div>

              <div class="surface-card p-5 bg-secondary-50/50 ring-1 ring-secondary-100 space-y-4 group/ship-provider hover:bg-white transition-colors duration-500">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
                  {{ $t("orders.detail.shippingProvider") }}
                </p>
                <div class="space-y-1">
                  <p class="text-sm font-black text-secondary-900 group-hover/ship-provider:text-secondary-900 transition-colors">
                    {{ order.shippingProvider }}
                  </p>
                  <p class="text-[11px] font-medium leading-relaxed text-secondary-500 uppercase tracking-widest">
                    #{{ $t(order.trackingCode) }}
                  </p>
                </div>
              </div>

              <div class="surface-card p-5 bg-secondary-50/50 ring-1 ring-secondary-100 space-y-4 group/est hover:bg-white transition-colors duration-500">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
                  {{ $t("orders.detail.estimatedProcess") }}
                </p>
                <div class="space-y-1">
                  <p class="text-sm font-black text-secondary-900 group-hover/est:text-secondary-900 transition-colors">
                    {{ $t(order.deliveryWindow) }}
                  </p>
                  <p class="text-[11px] font-medium leading-relaxed text-secondary-500 italic">
                    {{ $t(order.paymentMethod) }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="surface-card p-6 sm:p-8 space-y-8 ring-1 ring-secondary-100 shadow-xl transition-all duration-500">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-secondary-50 pb-6">
              <div class="space-y-1">
                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
                  {{ $t("orders.card.productsInOrder") }}
                </p>
                <h3 class="text-2xl font-black tracking-tight text-secondary-900 leading-tight">
                  {{ $t("orders.card.productsSummary", { count: totalItems }) }}
                </h3>
              </div>

              <UBadge color="white" variant="soft" size="lg" class="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm">
                {{ $t("orders.card.total", { total: formatOrderCurrency(order.total) }) }}
              </UBadge>
            </div>

            <div class="space-y-4">
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
            <section class="surface-card p-6 sm:p-8 space-y-8 ring-1 ring-secondary-100 shadow-xl transition-all duration-500">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
                {{ $t("orders.detail.deliveryAndNotes") }}
              </p>

              <div class="grid gap-4">
                <div class="surface-card p-5 bg-secondary-50/50 ring-1 ring-secondary-100 space-y-3 group/address hover:bg-white transition-colors duration-500">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
                    {{ $t("orders.card.shippingAddress") }}
                  </p>
                  <p class="text-sm font-semibold leading-relaxed text-secondary-600 group-hover/address:text-secondary-900 transition-colors">
                    {{ order.shippingAddress }}
                  </p>
                </div>

                <div class="surface-card p-5 bg-secondary-50/50 ring-1 ring-secondary-100 space-y-3 group/note hover:bg-white transition-colors duration-500">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
                    {{ $t("orders.detail.orderNote") }}
                  </p>
                  <p class="text-sm font-semibold leading-relaxed text-secondary-600 group-hover/note:text-secondary-900 transition-colors italic">
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
          class="surface-card p-6 sm:p-8 space-y-6 ring-1 ring-secondary-100 bg-white shadow-xl"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
            {{ $t("orders.sidebar.tasks") }}
          </p>
          <p class="text-sm font-medium leading-relaxed text-secondary-500">
            {{ $t("orders.sidebar.tasksAction") }}
          </p>
          <UButton
            to="/orders"
            size="xl"
            block
            icon="i-ph-arrow-left-duotone"
            class="rounded-2xl bg-secondary-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-secondary-900/10 transition-all active:scale-95 mt-2"
          >
            {{ $t("orders.sidebar.backToOrders") }}
          </UButton>
        </section>
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import { useOrderDetail } from "../../application/composables/useOrderDetail"
import { useOrderPresentation } from "../../application/composables/useOrderPresentation"
import { formatOrderCurrency } from "../../domain/types/orders.types"
import CheckoutLayout from "../../../checkout/presentation/components/CheckoutLayout.vue"
import OrdersOrderItemCard from "../components/OrdersOrderItemCard.vue"
import OrdersDetailTimelineCard from "../components/OrdersDetailTimelineCard.vue"
import OrdersDetailSidebar from "../components/OrdersDetailSidebar.vue"

const props = defineProps<{
  orderId: string
}>()

const { order } = useOrderDetail(computed(() => props.orderId))
const { statusMeta, totalItems } = useOrderPresentation(order)

const { t } = useI18n()

const pageTitle = computed(() =>
  order.value
    ? t("orders.page.detailTitle", { id: order.value.orderNumber })
    : t("orders.page.detailFallbackTitle"),
)

useSeoMeta({
  title: pageTitle,
  description: t("orders.page.detailDescription"),
})
</script>
