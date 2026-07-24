<!-- English description: Seller order sidebar with locale-aware payout totals and order actions. -->
<template>
  <div class="space-y-6">
    <section class="surface-card space-y-6 border border-[var(--border-light)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
        {{ $t("orders.sidebar.coordination") }}
      </p>

      <div class="space-y-4">
        <OrdersOrderPriceSummary
          :order="order"
          card-class="surface-card border border-[var(--border-light)] bg-[var(--bg-muted)] p-6 shadow-[var(--shadow-sm)]"
        />

        <!-- Payment Info Card -->
        <div class="surface-card group/info space-y-4 border border-[var(--border-light)] bg-[var(--bg-surface)] p-5">
          <p class="pl-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
            {{ $t("orders.summary.totalPayment") }}
          </p>
          <div class="flex flex-col gap-2">
            <p class="text-sm font-black text-[var(--text-primary)] transition-colors group-hover/info:text-[var(--text-primary)]">
              {{ displayOrderPaymentMethod(order.paymentMethod) }}
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <UBadge
                variant="soft"
                class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 ring-1 ring-inset"
                :class="paymentMeta.badgeClass"
              >
                {{ $t(paymentMeta.label) }}
              </UBadge>
              <span class="text-[10px] font-bold tracking-wider text-[var(--text-tertiary)]">
                #{{ order.paymentReference }}
              </span>
            </div>
          </div>
        </div>

        <!-- Payout Info Card -->
        <div class="surface-card group/payout space-y-4 border border-[var(--border-light)] bg-[var(--bg-surface)] p-5">
          <p class="pl-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {{ $t("orders.sidebar.payoutShop") }}
          </p>
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-base font-black text-[var(--text-primary)] transition-colors group-hover/payout:text-[var(--text-primary)]">
                {{ formatOrderCurrency(order.payoutAmount) }}
              </p>
              <UBadge
                variant="soft"
                class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 ring-1 ring-inset"
                :class="payoutMeta.badgeClass"
              >
                {{ $t(payoutMeta.label) }}
              </UBadge>
            </div>
            <div class="space-y-1">
              <p class="text-[11px] font-semibold italic leading-relaxed text-[var(--text-secondary)]">
                {{ displayOrderText(order.payoutWindow) }}
              </p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                ID: {{ order.payoutReference }}
              </p>
            </div>
          </div>
        </div>

        <!-- Shipping Info Card -->
        <div class="surface-card group/ship space-y-4 border border-[var(--border-light)] bg-[var(--bg-surface)] p-5">
          <p class="pl-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {{ $t("orders.detail.shippingProvider") }}
          </p>
          <div class="space-y-2">
            <p class="text-sm font-black text-[var(--text-primary)] transition-colors group-hover/ship:text-[var(--text-primary)]">
              {{ order.shippingProvider }}
            </p>
            <div class="flex items-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2">
              <Icon name="i-ph-package-duotone" class="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              <p class="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                {{ displayOrderText(order.trackingCode) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Payout Status Hint -->
        <div
          class="surface-card p-5 text-xs font-black uppercase tracking-widest leading-relaxed text-center"
          :class="payoutMeta.panelClass"
        >
          {{ $t(payoutMeta.description) }}
        </div>
      </div>
    </section>

    <!-- Task Section -->
    <section class="surface-card space-y-6 border border-[var(--border-light)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
        {{ $t("orders.sidebar.tasks") }}
      </p>

      <div class="flex flex-col gap-3">
        <UButton
          size="xl"
          icon="i-ph-lightning-duotone"
          class="h-12 rounded-2xl bg-[var(--bg-media)] text-xs font-black uppercase tracking-widest text-[var(--text-media)] shadow-[var(--shadow-lg)] transition-all hover:opacity-90 active:scale-95"
        >
          {{ $t(primaryActionLabel) }}
        </UButton>

        <UButton
          color="white"
          variant="soft"
          size="xl"
          icon="i-ph-chat-circle-dots-duotone"
        class="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest h-12 shadow-sm transition-all active:scale-95"
        >
          {{ $t("orders.card.contactBuyer", { buyer: order.buyerName }) }}
        </UButton>

        <UButton
          :to="appRoutes.myProducts"
          size="xl"
          icon="i-ph-arrow-left-duotone"
          class="h-12 rounded-2xl bg-[var(--bg-brand)] text-xs font-black uppercase tracking-widest text-[var(--text-inverse)] shadow-[var(--shadow-brand)] transition-all hover:bg-[var(--bg-brand-hover)] active:scale-95"
        >
          {{ $t("orders.sidebar.backToProducts") }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useOrderDisplayText } from "../../application/composables/useOrderDisplayText"
import { useOrderPresentation } from "../../application/composables/useOrderPresentation"
import {
  sellerOrderPayoutStatusMeta,
} from "../../domain/types/orders.types"
import type { SellerOrder } from "../../domain/types/orders.types"
import OrdersOrderPriceSummary from "./OrderPriceSummary.vue"

const props = defineProps<{
  order: SellerOrder
}>()

const { paymentMeta } = useOrderPresentation(computed(() => props.order))
const { locale } = useI18n()
const { displayOrderPaymentMethod, displayOrderText } = useOrderDisplayText()

const formatOrderCurrency = (value: number) =>
  formatCurrency(value, {
    currency: "VND",
    locale: locale.value,
  })

const payoutMeta = computed(() => sellerOrderPayoutStatusMeta[props.order.payoutStatus])

const primaryActionLabel = computed(() => {
  if (props.order.status === "pending") return "orders.sidebar.confirmOrder"
  if (props.order.status === "shipping") return "orders.sidebar.markDelivered"
  if (props.order.status === "delivered") return "orders.sidebar.viewPayout"
  return "orders.sidebar.viewCancelled"
})
</script>
