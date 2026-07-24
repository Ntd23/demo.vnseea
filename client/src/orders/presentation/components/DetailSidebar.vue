<!-- English description: Buyer order detail sidebar with payment, shipping, and follow-up actions. -->
<template>
  <div class="orders-detail-sidebar space-y-6">
    <section class="detail-sidebar-section surface-card space-y-6 border border-[var(--border-light)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
        {{ $t("orders.sidebar.overview") }}
      </p>

      <div class="space-y-4">
        <OrdersOrderPriceSummary
          :order="order"
          card-class="surface-card border border-[var(--border-light)] bg-[var(--bg-muted)] p-6 shadow-[var(--shadow-sm)]"
        />

        <div class="detail-sidebar-mini surface-card group/info space-y-4 border border-[var(--border-light)] bg-[var(--bg-surface)] p-5">
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

        <div class="detail-sidebar-mini surface-card group/ship space-y-4 border border-[var(--border-light)] bg-[var(--bg-surface)] p-5">
          <p class="pl-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {{ $t("orders.detail.shippingProvider") }}
          </p>
          <div class="space-y-2">
            <p class="text-sm font-black text-[var(--text-primary)] transition-colors group-hover/ship:text-[var(--text-primary)]">
              {{ order.shippingProvider || $t('orders.detail.noShippingProvider', 'Chưa xác định') }}
            </p>
            <div class="flex items-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2">
              <Icon name="i-ph-hash-duotone" class="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              <p class="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                {{ order.trackingCode || $t('orders.detail.noTrackingCode', 'Chưa có') }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="detail-sidebar-mini surface-card p-5 text-xs font-black uppercase tracking-widest leading-relaxed text-center"
          :class="statusMeta.panelClass"
        >
          {{ $t(statusMeta.description) }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  useOrderPresentation,
} from "../../application/composables/useOrderPresentation"
import { useOrderDisplayText } from "../../application/composables/useOrderDisplayText"
import type { BuyerOrder } from "../../domain/types/orders.types"
import OrdersOrderPriceSummary from "./OrderPriceSummary.vue"

const props = defineProps<{
  order: BuyerOrder
}>()

const { paymentMeta, statusMeta } = useOrderPresentation(computed(() => props.order))
const { displayOrderPaymentMethod } = useOrderDisplayText()
</script>

<style scoped>
@media (max-width: 480px) {
  .orders-detail-sidebar {
    gap: 12px;
  }

  .detail-sidebar-section {
    padding: 14px !important;
    border-radius: 14px;
  }

  .detail-sidebar-mini {
    padding: 12px !important;
    border-radius: 12px;
  }

  .detail-sidebar-section :deep(.space-y-6),
  .detail-sidebar-section :deep(.space-y-4) {
    gap: 10px;
  }
}
</style>
