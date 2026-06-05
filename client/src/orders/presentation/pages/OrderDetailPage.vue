<!-- English description: Buyer order detail page with a responsive marketplace tracking layout. -->
<template>
  <div class="order-detail-page">
    <header class="order-detail-header">
      <NuxtLink
        to="/purchased"
        class="order-detail-back"
        :aria-label="$t('orders.sidebar.backToOrders')"
      >
        <Icon name="i-ph-arrow-left-bold" class="h-5 w-5" />
      </NuxtLink>

      <div class="order-detail-heading">
      
        <h1 class="order-detail-title">
          {{ pageTitle }}
        </h1>
      </div>

    </header>

    <div v-if="order && statusMeta" class="order-detail-layout">
      <main class="order-detail-main">

        <section class="order-detail-progress-card">
          <div class="order-detail-section-head">
            <div>
              <h3 class="order-detail-section-title">
                {{ $t("orders.detail.estimatedProcess") }}
              </h3>
            </div>
            <span class="order-detail-chip">{{ displayOrderText(order.deliveryWindow) }}</span>
          </div>

          <div class="progress-stepper" :style="{ '--progress-pct': progressPercentage + '%' }">
            <div class="progress-stepper__track">
              <div class="progress-stepper__track-fill"></div>
            </div>
            <ol class="progress-stepper__list">
              <li
                v-for="step in progressSteps"
                :key="step.key"
                class="progress-stepper__item"
              >
                <div
                  class="progress-stepper__marker"
                  :class="{
                    'progress-stepper__marker--done': step.done,
                    'progress-stepper__marker--active': step.active
                  }"
                >
                  <Icon :name="step.icon" class="h-5 w-5" />
                  <span
                    v-if="step.done"
                    class="progress-stepper__badge"
                  >
                    <Icon name="i-ph-check-bold" class="h-2.5 w-2.5" />
                  </span>
                </div>
                <div class="progress-stepper__content">
                  <p
                    class="progress-stepper__label"
                    :class="{ 'progress-stepper__label--active': step.done || step.active }"
                  >
                    {{ $t(step.label) }}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section class="order-detail-card">
          <div class="order-detail-section-head">
            <div>
              <p class="order-detail-section-eyebrow">
                {{ $t("orders.card.productsInOrder") }}
              </p>
              <h3 class="order-detail-section-title">
                {{ $t("orders.card.productsSummary", { count: totalItems }) }}
              </h3>
            </div>
          </div>

          <div class="order-detail-items">
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

        <section class="order-detail-card order-detail-delivery-recipient-card">
          <div class="order-detail-delivery-grid">
            <div class="order-detail-delivery-section">
              <p class="order-detail-section-eyebrow">
                {{ $t("orders.detail.recipient") }}
              </p>
              <div class="order-detail-person">
                <span class="order-detail-person__avatar">
                  <Icon name="i-ph-user-circle-duotone" class="h-8 w-8" />
                </span>
                <div>
                  <strong>{{ order.recipientName }}</strong>
                  <span>{{ order.recipientPhone }}</span>
                </div>
              </div>
            </div>

            <div class="order-detail-delivery-section">
              <p class="order-detail-section-eyebrow">
                {{ $t("orders.detail.deliveryAndNotes") }}
              </p>

              <div class="order-detail-info-list">
                <div class="order-detail-info">
                  <span class="order-detail-info__icon-wrapper">
                    <Icon name="i-ph-map-pin-duotone" class="order-detail-info__icon" />
                  </span>
                  <div>
                    <span>{{ $t("orders.card.shippingAddress") }}</span>
                    <strong>{{ order.shippingAddress }}</strong>
                  </div>
                </div>

                <div class="order-detail-info">
                  <span class="order-detail-info__icon-wrapper">
                    <Icon name="i-ph-note-pencil-duotone" class="order-detail-info__icon" />
                  </span>
                  <div>
                    <span>{{ $t("orders.detail.orderNote") }}</span>
                    <strong>{{ order.note || $t("orders.detail.noNote") }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <aside class="order-detail-side">
        <OrdersDetailSidebar :order="order" />
      </aside>
    </div>

    <div v-else class="order-detail-missing">
      <FoundationEmptyState
        icon="i-ph-package-fill"
        :title="$t('orders.detail.notFound')"
        :description="$t('orders.detail.notFoundDesc')"
      />

      <UButton
        to="/orders"
        color="primary"
        variant="solid"
        size="lg"
        icon="i-ph-arrow-left-duotone"
      >
        {{ $t("orders.sidebar.backToOrders") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import {
  useOrderPresentation,
} from "../../application/composables/useOrderPresentation"
import { useOrderDisplayText } from "../../application/composables/useOrderDisplayText"
import { useBuyerOrderDetailVM } from "../../application/view-models/useBuyerOrderDetailVM"
import OrdersDetailSidebar from "../components/DetailSidebar.vue"
import OrdersOrderItemCard from "../components/OrderItemCard.vue"

const props = defineProps<{
  orderId: string
}>()

const { order } = useBuyerOrderDetailVM(() => props.orderId)
const { statusMeta, totalItems, activeProgressStep } = useOrderPresentation(order)

const { t, locale } = useI18n()
const { displayOrderText } = useOrderDisplayText()

const formatOrderCurrency = (value: number) =>
  formatCurrency(value, {
    currency: "VND",
    locale: locale.value,
  })

const pageTitle = computed(() =>
  order.value
    ? t("orders.page.detailTitle", { id: order.value.orderNumber })
    : t("orders.page.detailFallbackTitle"),
)

const orderedFromTitle = computed(() =>
  order.value
    ? t("orders.card.orderedFrom", {
        seller: order.value.seller,
        price: formatOrderCurrency(order.value.total),
      }).split(/\s(?:•|â€¢)\s/)[0]
    : "",
)

const progressSteps = computed(() => [
  {
    key: "placed",
    label: "orders.steps.placed.label",
    icon: "i-ph-file-text-duotone",
    done: activeProgressStep.value >= 1,
    active: activeProgressStep.value === 0,
  },
  {
    key: "processing",
    label: "orders.steps.processing.label",
    icon: "i-ph-gear-six-duotone",
    done: activeProgressStep.value >= 1,
    active: activeProgressStep.value === 0,
  },
  {
    key: "shipping",
    label: "orders.steps.shipping.label",
    icon: "i-ph-truck-duotone",
    done: activeProgressStep.value >= 2,
    active: activeProgressStep.value === 1,
  },
  {
    key: "completed",
    label: "orders.steps.completed.label",
    icon: "i-ph-check-circle-duotone",
    done: activeProgressStep.value >= 3,
    active: activeProgressStep.value === 2,
  },
])

const progressPercentage = computed(() => {
  if (activeProgressStep.value >= 3) return 100
  if (activeProgressStep.value === 2) return 66.6
  if (activeProgressStep.value === 1) return 33.3
  return 0
})

useSeoMeta({
  title: pageTitle,
  description: t("orders.page.detailDescription"),
})
</script>

<style scoped>
.order-detail-page {
  --order-brand: var(--color-primary-500, #0000ff);
  --order-card: var(--surface-card, #ffffff);
  --order-border: var(--border-light, #e2e8f0);
  --order-soft: var(--surface-muted, #fafbfe);
  --order-text: var(--text-primary, #0f172a);
  --order-muted: var(--text-tertiary, #64748b);
  container-type: inline-size;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 12px 48px;
}

.order-detail-header,
.order-detail-hero,
.order-detail-card,
.order-detail-progress-card {
  border: 1px solid var(--order-border);
  border-radius: 16px;
  background: var(--order-card);
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.04), 0 2px 8px -2px rgba(0, 0, 0, 0.02);
}

.order-detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.order-detail-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--order-border);
  background: var(--order-card);
  color: var(--order-text);
  text-decoration: none;
  transition: all 0.15s ease;
  cursor: pointer;
}

.order-detail-back:hover {
  background: var(--order-soft);
  border-color: var(--order-brand);
  color: var(--order-brand);
}

.order-detail-heading {
  flex: 1;
  min-width: 0;
}

.order-detail-eyebrow,
.order-detail-section-eyebrow {
  margin: 0;
  color: var(--order-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-transform: uppercase;
}

.order-detail-title {
  overflow: hidden;
  margin: 4px 0 0;
  color: var(--order-text);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-detail-status {
  min-height: 32px;
  border-radius: 999px;
  padding: 0 12px;
  font-size: 11px;
  font-weight: 700;
}

.order-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.order-detail-main,
.order-detail-side,
.order-detail-items,
.order-detail-info-list,
.order-detail-hero,
.order-detail-hero__content,
.order-detail-hero__facts,
.order-detail-card,
.order-detail-progress-card {
  min-width: 0;
}

.order-detail-main,
.order-detail-side,
.order-detail-items,
.order-detail-info-list {
  display: grid;
  gap: 20px;
}

.order-detail-side {
  position: static;
}

.order-detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  padding: 24px;
}

.order-detail-code {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--order-muted);
  border-radius: 8px;
  background: var(--order-soft);
  padding: 4px 10px;
  margin-bottom: 8px;
  border: 1px solid #f1f5f9;
}

.order-detail-shop {
  margin: 0;
  color: var(--order-text);
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.order-detail-description {
  max-width: 720px;
  margin: 10px 0 0;
  color: var(--order-muted);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
}

.order-detail-hero__facts {
  display: grid;
  gap: 12px;
  align-content: start;
}

.order-detail-fact,
.order-detail-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: var(--order-soft);
  padding: 12px 16px;
}

.order-detail-fact > div,
.order-detail-info > div {
  min-width: 0;
}


.order-detail-fact__icon,
.order-detail-info__icon {
  width: 18px;
  height: 18px;
}

.order-detail-fact span,
.order-detail-info span {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--order-muted);
  letter-spacing: 0.04em;
}

.order-detail-fact strong,
.order-detail-info strong {
  display: block;
  margin-top: 2px;
  color: var(--order-text);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.order-detail-card,
.order-detail-progress-card {
  padding: 24px;
}

.order-detail-section-head {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.order-detail-section-title {
  margin: 4px 0 0;
  color: var(--order-text);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
}

.order-detail-chip {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  background: var(--order-soft);
  border: 1px solid rgba(0, 0, 255, 0.08);
  padding: 0 14px;
  color: var(--order-brand);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

/* ─── Connected Progress Stepper ───────────────────────── */
.progress-stepper {
  position: relative;
  width: 100%;
}

@media (min-width: 640px) {
  .progress-stepper {
    padding: 16px 8px;
  }
  .progress-stepper__track {
    position: absolute;
    top: 36px; /* half of 40px marker height + 16px padding */
    left: 48px;
    right: 48px;
    height: 3px;
    background: var(--order-border);
    border-radius: 99px;
    transform: translateY(-50%);
  }
  .progress-stepper__track-fill {
    height: 100%;
    width: var(--progress-pct, 0%);
    background: var(--order-brand);
    border-radius: 99px;
    transition: width 0.4s ease;
  }
  .progress-stepper__list {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .progress-stepper__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 120px;
    z-index: 10;
  }
  .progress-stepper__content {
    margin-top: 12px;
  }
}

@media (max-width: 639.98px) {
  .progress-stepper {
    padding: 8px 0 2px;
  }

  .progress-stepper__track {
    position: absolute;
    top: 23px;
    right: calc(12.5% + 15px);
    left: calc(12.5% + 15px);
    height: 3px;
    background: var(--order-border);
    border-radius: 99px;
    transform: translateY(-50%);
  }

  .progress-stepper__track-fill {
    height: 100%;
    width: var(--progress-pct, 0%);
    background: var(--order-brand);
    border-radius: 99px;
    transition: width 0.4s ease;
  }

  .progress-stepper__list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .progress-stepper__item {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    z-index: 10;
  }

  .progress-stepper__content {
    margin-top: 0;
    min-width: 0;
    width: 100%;
  }
}

.progress-stepper__marker {
  position: relative;
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 2px solid var(--order-border);
  background: var(--order-card);
  color: var(--order-muted);
  transition: all 0.25s ease;
}

.progress-stepper__marker--done {
  background: var(--order-brand);
  border-color: var(--order-brand);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 255, 0.2);
}

.progress-stepper__marker--active {
  border-color: var(--order-brand);
  color: var(--order-brand);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 255, 0.1), 0 0 0 4px var(--color-primary-50, rgba(0, 0, 255, 0.05));
  animation: marker-pulse 2s infinite ease-in-out;
}

@keyframes marker-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.progress-stepper__badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #0ea5e9;
  border: 1.5px solid #ffffff;
  color: #ffffff;
}

.progress-stepper__label {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--order-muted);
  transition: color 0.2s ease;
}

.progress-stepper__label--active {
  color: var(--order-text);
  font-weight: 700;
}

/* ─── Grid details & Info ──────────────────────────────── */
.order-detail-delivery-recipient-card {
  padding: 24px;
}

.order-detail-delivery-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.order-detail-delivery-section {
  display: flex;
  flex-direction: column;
}

.order-detail-delivery-section:first-child {
  border-bottom: 1px solid var(--order-border);
  padding-bottom: 24px;
}

.order-detail-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.order-detail-info {
  align-items: flex-start;
}

.order-detail-info strong {
  white-space: normal;
}

.order-detail-person {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
  margin-top: 16px;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  background: var(--order-soft);
  padding: 14px 16px;
}

.order-detail-person__avatar {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffffff;
  color: var(--order-brand);
  border: 1px solid rgba(0, 0, 255, 0.08);
  box-shadow: 0 2px 6px rgba(0, 0, 255, 0.05);
}

.order-detail-person > div {
  min-width: 0;
}

.order-detail-person strong {
  display: block;
  color: var(--order-text);
  font-size: 14px;
  font-weight: 750;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.order-detail-person span {
  display: block;
  margin-top: 2px;
  color: var(--order-muted);
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

@container (min-width: 760px) {
  .order-detail-delivery-grid {
    grid-template-columns: minmax(200px, 240px) minmax(0, 1fr);
    gap: 32px;
  }

  .order-detail-delivery-section:first-child {
    border-right: 1px solid var(--order-border);
    border-bottom: none;
    padding-right: 32px;
    padding-bottom: 0;
  }
}

@container (min-width: 860px) {
  .order-detail-hero {
    grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
  }
}

@container (min-width: 1260px) {
  .order-detail-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
  }

  .order-detail-side {
    position: sticky;
    top: 88px;
  }
}

.order-detail-side :deep(.surface-card),
.order-detail-side :deep(.flex),
.order-detail-side :deep(.space-y-4),
.order-detail-side :deep(.space-y-6) {
  min-width: 0;
}

.order-detail-side :deep(p),
.order-detail-side :deep(span),
.order-detail-side :deep(strong),
.order-detail-side :deep(div) {
  overflow-wrap: anywhere;
}

.order-detail-missing {
  display: grid;
  justify-items: center;
  gap: 16px;
  margin-top: 20px;
  border: 1px solid var(--order-border);
  border-radius: 16px;
  background: #ffffff;
  padding: 32px 24px;
}

@media (max-width: 760px) {
  .order-detail-page {
    padding: 8px 0 28px;
  }

  .order-detail-header {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    align-items: center;
    gap: 8px 10px;
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 14px;
  }

  .order-detail-back {
    width: 36px;
    height: 36px;
  }

  .order-detail-status {
    grid-column: 2;
    justify-self: start;
    min-height: 24px;
    font-size: 10px;
    padding: 0 9px;
  }

  .order-detail-title {
    font-size: 13px;
    white-space: normal;
  }

  .order-detail-eyebrow,
  .order-detail-section-eyebrow {
    font-size: 9px;
    letter-spacing: 0.045em;
  }

  .order-detail-layout,
  .order-detail-main,
  .order-detail-side,
  .order-detail-items,
  .order-detail-info-list {
    gap: 12px;
  }

  .order-detail-hero {
    gap: 12px;
    padding: 14px;
    border-radius: 14px;
  }

  .order-detail-code {
    max-width: 100%;
    overflow: hidden;
    margin-bottom: 6px;
    padding: 3px 8px;
    font-size: 9px;
    text-overflow: ellipsis;
  }

  .order-detail-shop {
    font-size: 16px;
  }

  .order-detail-description {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.45;
  }

  .order-detail-hero__facts {
    gap: 8px;
  }

  .order-detail-fact,
  .order-detail-info {
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
  }

  .order-detail-fact__icon-wrapper,
  .order-detail-info__icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .order-detail-fact span,
  .order-detail-info span {
    font-size: 9px;
  }

  .order-detail-fact strong,
  .order-detail-info strong {
    font-size: 12px;
  }

  .order-detail-card,
  .order-detail-progress-card {
    padding: 14px;
    border-radius: 14px;
  }

  .order-detail-section-head {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .order-detail-section-title {
    font-size: 13px;
  }

  .order-detail-chip {
    align-self: flex-start;
    max-width: 100%;
    min-height: 24px;
    padding: 0 10px;
    overflow: hidden;
    font-size: 10px;
    text-overflow: ellipsis;
  }
}

@media (max-width: 480px) {
  .progress-stepper {
    padding: 6px 0 0;
  }

  .progress-stepper__track {
    top: 21px;
    right: calc(12.5% + 13px);
    left: calc(12.5% + 13px);
  }

  .progress-stepper__list {
    gap: 2px;
  }

  .progress-stepper__item {
    gap: 7px;
  }

  .progress-stepper__marker {
    width: 28px;
    height: 28px;
    border-radius: 10px;
  }

  .progress-stepper__marker :deep(svg) {
    width: 16px;
    height: 16px;
  }

  .progress-stepper__badge {
    width: 13px;
    height: 13px;
  }

  .progress-stepper__label {
    display: -webkit-box;
    overflow: hidden;
    font-size: 9px;
    line-height: 1.2;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .order-detail-delivery-recipient-card {
    padding: 14px;
  }

  .order-detail-delivery-grid {
    gap: 16px;
  }

  .order-detail-delivery-section:first-child {
    padding-bottom: 16px;
  }

  .order-detail-person {
    padding: 10px 12px;
  }

  .order-detail-person__avatar {
    width: 34px;
    height: 34px;
  }
}
</style>
