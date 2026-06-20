<!-- English description: Seller-facing order detail page with locale-aware payout and total values. -->
<template>
  <div class="customer-order-page">
    <header class="customer-order-header">
      <NuxtLink
        :to="appRoutes.myProducts"
        class="customer-order-back"
        :aria-label="$t('orders.sidebar.backToProducts')"
      >
        <Icon name="i-ph-arrow-left-bold" class="h-5 w-5" />
      </NuxtLink>

      <div class="customer-order-heading">
        <p class="customer-order-eyebrow">
          {{ $t("orders.page.customerEyebrow") }}
        </p>
        <h1 class="customer-order-title">
          {{ pageTitle }}
        </h1>
      </div>

      <span
        v-if="order"
        class="customer-order-status"
        :class="statusMeta.badgeClass"
      >
        <Icon :name="statusMeta.icon" class="h-4 w-4" />
        {{ $t(statusMeta.label) }}
      </span>
    </header>

    <div v-if="order" class="customer-order-layout">
      <main class="customer-order-main">
        <section class="customer-order-card customer-order-hero">
          <div class="customer-order-hero__copy">
            <div class="customer-order-badges">
              <span class="customer-order-code">{{ order.orderNumber }}</span>
              <span class="customer-order-pill">{{ order.placedAt }}</span>
              <span
                class="customer-order-pill customer-order-pill--bordered"
                :class="payoutMeta.badgeClass"
              >
                {{ $t(payoutMeta.label) }}
              </span>
            </div>

            <h2 class="customer-order-hero__title">
              {{ $t("orders.card.contactBuyer", { buyer: order.buyerName }) }}
            </h2>
            <p class="customer-order-hero__description">
              {{ $t(statusMeta.description) }}
            </p>
          </div>

          <div class="customer-order-facts">
            <article class="customer-order-fact">
              <span class="customer-order-fact__icon">
                <Icon name="i-ph-user-circle-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.detail.buyer") }}</span>
                <strong>{{ order.buyerName }}</strong>
                <small>{{ order.buyerPhone }}</small>
              </div>
            </article>

            <article class="customer-order-fact">
              <span class="customer-order-fact__icon">
                <Icon name="i-ph-storefront-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.card.customerProducts") }}</span>
                <strong>{{ order.storeName }}</strong>
                <small>{{ $t("orders.card.items", { count: totalItems }) }}</small>
              </div>
            </article>

            <article class="customer-order-fact">
              <span class="customer-order-fact__icon">
                <Icon name="i-ph-wallet-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.detail.payout") }}</span>
                <strong>{{ formatOrderCurrency(order.payoutAmount) }}</strong>
                <small>{{ displayOrderText(order.payoutWindow) }}</small>
              </div>
            </article>
          </div>
        </section>

        <section class="customer-order-card">
          <div class="customer-order-section-head">
            <div>
              <p class="customer-order-eyebrow">
                {{ $t("orders.card.customerProducts") }}
              </p>
              <h2 class="customer-order-section-title">
                {{ $t("orders.card.productsRemaining", { count: totalItems }) }}
              </h2>
            </div>

            <span class="customer-order-total">
              {{ $t("orders.card.total", { total: formatOrderCurrency(order.total) }) }}
            </span>
          </div>

          <div class="customer-order-items">
            <OrdersOrderItemCard
              v-for="item in order.items"
              :key="item.id"
              :item="item"
              :meta-text="$t('orders.card.belongsToStore', { store: order.storeName, price: formatOrderCurrency(item.price) })"
              :payment-method="order.paymentMethod"
              variant="detail"
            />
          </div>
        </section>

        <section class="customer-order-card">
          <div class="customer-order-section-head customer-order-section-head--compact">
            <div>
              <p class="customer-order-eyebrow">
                {{ $t("orders.detail.buyerAndNotes") }}
              </p>
              <h2 class="customer-order-section-title">
                {{ $t("orders.detail.deliveryAndNotes") }}
              </h2>
            </div>
          </div>

          <div class="customer-order-info-grid">
            <article class="customer-order-info customer-order-info--wide">
              <span class="customer-order-info__icon">
                <Icon name="i-ph-map-pin-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.card.shippingAddress") }}</span>
                <strong>{{ order.buyerAddress }}</strong>
              </div>
            </article>

            <article class="customer-order-info">
              <span class="customer-order-info__icon">
                <Icon name="i-ph-credit-card-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.summary.totalPayment") }}</span>
                <strong>{{ displayOrderPaymentMethod(order.paymentMethod) }}</strong>
                <small>{{ order.paymentReference }}</small>
                <em :class="paymentMeta.badgeClass">{{ $t(paymentMeta.label) }}</em>
              </div>
            </article>

            <article class="customer-order-info">
              <span class="customer-order-info__icon">
                <Icon name="i-ph-truck-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.detail.shippingProvider") }}</span>
                <strong>{{ order.shippingProvider }}</strong>
                <small>{{ $t("orders.detail.trackingCodeLabel", { code: displayOrderText(order.trackingCode) }) }}</small>
              </div>
            </article>

            <article class="customer-order-info">
              <span class="customer-order-info__icon">
                <Icon name="i-ph-clock-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.detail.estimatedWindow") }}</span>
                <strong>{{ displayOrderText(order.deliveryWindow) }}</strong>
                <small>{{ $t("orders.detail.buyer") }}: {{ order.buyerPhone }}</small>
              </div>
            </article>

            <article class="customer-order-info">
              <span class="customer-order-info__icon">
                <Icon name="i-ph-note-pencil-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.detail.buyerNote") }}</span>
                <strong>{{ order.buyerNote || $t("orders.detail.noBuyerNote") }}</strong>
              </div>
            </article>

            <article class="customer-order-info customer-order-info--wide">
              <span class="customer-order-info__icon">
                <Icon name="i-ph-clipboard-text-duotone" class="h-5 w-5" />
              </span>
              <div>
                <span>{{ $t("orders.detail.internalNote") }}</span>
                <strong>{{ order.sellerNote || $t("orders.detail.noInternalNote") }}</strong>
              </div>
            </article>
          </div>
        </section>

        <OrdersSellerOrderChecklistCard :order="order" />
        <OrdersDetailTimelineCard :events="order.timeline" />
      </main>

      <aside class="customer-order-side">
        <OrdersSellerOrderSidebar :order="order" />
      </aside>
    </div>

    <section v-else class="customer-order-missing">
      <FoundationEmptyState
        icon="i-ph-package-fill"
        :title="$t('orders.detail.sellerNotFound')"
        :description="$t('orders.detail.sellerNotFoundDesc')"
      />
      <UButton
        :to="appRoutes.myProducts"
        color="primary"
        size="lg"
        icon="i-ph-arrow-left-duotone"
      >
        {{ $t("orders.sidebar.backToProducts") }}
      </UButton>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import { useOrderDisplayText } from "../../application/composables/useOrderDisplayText"
import { useOrderPresentation } from "../../application/composables/useOrderPresentation"
import { useSellerOrderDetailVM } from "../../application/view-models/useSellerOrderDetailVM"
import {
  sellerOrderPayoutStatusMeta,
} from "../../domain/types/orders.types"
import OrdersDetailTimelineCard from "../components/DetailTimelineCard.vue"
import OrdersOrderItemCard from "../components/OrderItemCard.vue"
import OrdersSellerOrderChecklistCard from "../components/SellerOrderChecklistCard.vue"
import OrdersSellerOrderSidebar from "../components/SellerOrderSidebar.vue"

const props = defineProps<{
  orderId: string
}>()

const { order } = useSellerOrderDetailVM(() => props.orderId)
const { paymentMeta, statusMeta, totalItems } = useOrderPresentation(order)

const payoutMeta = computed(() =>
  order.value
    ? sellerOrderPayoutStatusMeta[order.value.payoutStatus]
    : sellerOrderPayoutStatusMeta.queued,
)

const { t, locale } = useI18n()
const { displayOrderPaymentMethod, displayOrderText } = useOrderDisplayText()

const formatOrderCurrency = (value: number) =>
  formatCurrency(value, {
    currency: "VND",
    locale: locale.value,
  })

useSeoMeta({
  title: t("orders.page.title"),
  description: t("orders.page.description"),
})

const pageTitle = computed(() =>
  order.value
    ? t("orders.page.customerTitle", { id: order.value.orderNumber })
    : t("orders.page.customerFallbackTitle"),
)
</script>

<style scoped>
.customer-order-page {
  --order-brand: var(--color-primary-500, #0000ff);
  --order-card: var(--surface-card, #ffffff);
  --order-border: var(--border-light, #e2e8f0);
  --order-soft: var(--surface-muted, #f8fafc);
  --order-text: var(--text-primary, #0f172a);
  --order-muted: var(--text-tertiary, #64748b);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 12px 48px;
}

.customer-order-header,
.customer-order-card,
.customer-order-missing {
  border: 1px solid var(--order-border);
  border-radius: 16px;
  background: var(--order-card);
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.06);
}

.customer-order-header {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
}

.customer-order-back {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--order-border);
  border-radius: 12px;
  color: var(--order-text);
  background: #ffffff;
  transition: all 0.16s ease;
}

.customer-order-back:hover {
  border-color: var(--order-brand);
  color: var(--order-brand);
  background: var(--order-soft);
}

.customer-order-heading,
.customer-order-main,
.customer-order-side,
.customer-order-items,
.customer-order-facts,
.customer-order-info-grid {
  min-width: 0;
}

.customer-order-eyebrow {
  margin: 0;
  color: var(--order-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-transform: uppercase;
}

.customer-order-title {
  overflow: hidden;
  margin: 4px 0 0;
  color: var(--order-text);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-order-status,
.customer-order-pill,
.customer-order-code,
.customer-order-total {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.2;
  white-space: nowrap;
}

.customer-order-status {
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
}

.customer-order-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.customer-order-main,
.customer-order-side,
.customer-order-items {
  display: grid;
  gap: 20px;
}

.customer-order-card {
  padding: 24px;
}

.customer-order-hero {
  display: grid;
  gap: 24px;
}

.customer-order-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.customer-order-code {
  max-width: 100%;
  overflow: hidden;
  padding: 7px 10px;
  border: 1px solid #eef2f7;
  background: var(--order-soft);
  color: var(--order-muted);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.customer-order-pill {
  max-width: 100%;
  overflow: hidden;
  padding: 7px 10px;
  background: var(--order-soft);
  color: var(--order-muted);
  text-overflow: ellipsis;
}

.customer-order-pill--bordered {
  border: 1px solid currentColor;
  background: #ffffff;
}

.customer-order-hero__title {
  margin: 14px 0 0;
  color: var(--order-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.customer-order-hero__description {
  max-width: 720px;
  margin: 10px 0 0;
  color: var(--order-muted);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.65;
}

.customer-order-facts {
  display: grid;
  gap: 12px;
}

.customer-order-fact,
.customer-order-info {
  display: flex;
  min-width: 0;
  gap: 12px;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: var(--order-soft);
  padding: 14px;
}

.customer-order-fact {
  align-items: center;
}

.customer-order-info {
  align-items: flex-start;
}

.customer-order-fact__icon,
.customer-order-info__icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 255, 0.08);
  border-radius: 12px;
  color: var(--order-brand);
  background: #ffffff;
}

.customer-order-fact > div,
.customer-order-info > div {
  min-width: 0;
}

.customer-order-fact span:not(.customer-order-fact__icon),
.customer-order-info span:not(.customer-order-info__icon) {
  display: block;
  color: var(--order-muted);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.045em;
  line-height: 1.2;
  text-transform: uppercase;
}

.customer-order-fact strong,
.customer-order-info strong {
  display: block;
  margin-top: 4px;
  color: var(--order-text);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.customer-order-fact small,
.customer-order-info small {
  display: block;
  margin-top: 3px;
  color: var(--order-muted);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.customer-order-info em {
  display: inline-flex;
  margin-top: 10px;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 10px;
  font-style: normal;
  font-weight: 750;
}

.customer-order-section-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.customer-order-section-head--compact {
  margin-bottom: 16px;
}

.customer-order-section-title {
  margin: 4px 0 0;
  color: var(--order-text);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
}

.customer-order-total {
  max-width: 100%;
  padding: 8px 11px;
  color: var(--order-brand);
  background: rgba(0, 0, 255, 0.05);
  overflow-wrap: anywhere;
  white-space: normal;
}

.customer-order-info-grid {
  display: grid;
  gap: 12px;
}

.customer-order-missing {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 32px 20px;
}

.customer-order-side :deep(.surface-card),
.customer-order-side :deep(.flex),
.customer-order-side :deep(.space-y-4),
.customer-order-side :deep(.space-y-6),
.customer-order-main :deep(.surface-card),
.customer-order-main :deep(.flex) {
  min-width: 0;
}

.customer-order-side :deep(p),
.customer-order-side :deep(span),
.customer-order-side :deep(strong),
.customer-order-side :deep(div),
.customer-order-main :deep(p),
.customer-order-main :deep(span),
.customer-order-main :deep(strong),
.customer-order-main :deep(div) {
  overflow-wrap: anywhere;
}

@media (min-width: 760px) {
  .customer-order-facts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .customer-order-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .customer-order-info--wide {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1180px) {
  .customer-order-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
  }

  .customer-order-side {
    position: sticky;
    top: 88px;
  }
}

@media (min-width: 1320px) {
  .customer-order-layout {
    grid-template-columns: minmax(0, 1fr) 380px;
  }

  .customer-order-hero {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 759.98px) {
  .customer-order-page {
    padding: 8px 0 32px;
  }

  .customer-order-header {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 14px;
  }

  .customer-order-back {
    width: 38px;
    height: 38px;
  }

  .customer-order-status {
    grid-column: 2;
    justify-self: start;
    min-height: 28px;
    padding: 0 10px;
    font-size: 11px;
  }

  .customer-order-title {
    font-size: 14px;
    white-space: normal;
  }

  .customer-order-layout,
  .customer-order-main,
  .customer-order-side,
  .customer-order-items {
    gap: 12px;
  }

  .customer-order-card {
    padding: 14px;
    border-radius: 14px;
  }

  .customer-order-hero {
    gap: 14px;
  }

  .customer-order-eyebrow {
    font-size: 9px;
    letter-spacing: 0.045em;
  }

  .customer-order-hero__title {
    margin-top: 10px;
    font-size: 18px;
  }

  .customer-order-hero__description {
    font-size: 12px;
    line-height: 1.5;
  }

  .customer-order-code,
  .customer-order-pill {
    padding: 6px 9px;
    font-size: 10px;
  }

  .customer-order-fact,
  .customer-order-info {
    gap: 10px;
    padding: 11px;
    border-radius: 12px;
  }

  .customer-order-fact__icon,
  .customer-order-info__icon {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    border-radius: 10px;
  }

  .customer-order-section-head {
    flex-direction: column;
    margin-bottom: 12px;
  }

  .customer-order-section-title {
    font-size: 15px;
  }

  .customer-order-total {
    align-self: stretch;
    justify-content: center;
  }

  .customer-order-side :deep(.surface-card),
  .customer-order-main :deep(.surface-card) {
    border-radius: 14px !important;
  }

  .customer-order-side :deep(.p-6),
  .customer-order-side :deep(.sm\:p-8),
  .customer-order-main :deep(.p-6),
  .customer-order-main :deep(.sm\:p-8) {
    padding: 14px !important;
  }
}
</style>
