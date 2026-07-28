<!-- English description: Order item card with shared locale-aware currency formatting. -->
<template>
  <article
    v-if="variant === 'detail'"
    class="surface-card order-item-article-detail group border border-[var(--border-light)] bg-[var(--bg-surface)] p-5 transition-all duration-500 hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]"
  >
    <div class="order-item-image-wrapper">
      <div class="order-item-image-bg" :style="{ backgroundImage: item.imageStyle || orderItemFallbackBackground }" />
      <div class="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg-media)_20%,transparent),transparent)]" />
      <div class="absolute inset-0 ring-1 ring-inset ring-[var(--border-media)]" />
      
      <div class="absolute left-2.5 top-2.5 z-10 rounded-lg border border-[var(--border-media)] bg-[color-mix(in_srgb,var(--bg-media)_60%,transparent)] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--text-media)] shadow-[var(--shadow-lg)] backdrop-blur-md">
        {{ variant === 'detail' ? $t('orders.card.itemLabel') : $t('orders.card.qtyCompact', { count: item.quantity }) }}
      </div>
    </div>

    <div class="min-w-0 flex-1 space-y-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 space-y-1">
          <p class="order-item-title text-lg font-black tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-primary)]">
            {{ displayOrderText(item.name) }}
          </p>
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-[var(--bg-brand)]" />
            <p class="order-item-meta text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
              {{ detailMetaText }}
            </p>
          </div>
        </div>

        <div class="order-item-price text-right">
          <p class="text-xl font-black tracking-tight text-[var(--text-primary)]">
            {{ formatOrderCurrency(item.price * item.quantity) }}
          </p>
          <p v-if="item.point" class="mt-1 text-sm font-black text-[var(--text-brand)]">
            {{ formatOrderPoints(item.point * item.quantity) }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 pt-1">
        <UBadge color="neutral" variant="soft" class="rounded-lg bg-[var(--bg-muted)] ring-1 ring-[var(--border-light)] px-3 py-1.5 font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] shadow-sm">
          <Icon name="i-ph-hash-duotone" class="mr-1.5 h-3.5 w-3.5" />
          {{ $t("orders.card.qty", { count: item.quantity }) }}
        </UBadge>
        <UBadge v-if="paymentMethod" color="neutral" variant="soft" class="rounded-lg bg-[var(--bg-muted)] ring-1 ring-[var(--border-light)] px-3 py-1.5 font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)] shadow-sm">
          <Icon name="i-ph-credit-card-duotone" class="mr-1.5 h-3.5 w-3.5" />
          {{ displayOrderPaymentMethod(paymentMethod) }}
        </UBadge>
      </div>
    </div>
  </article>

  <div
    v-else
    class="surface-card group flex gap-4 border border-[var(--border-light)] bg-[var(--bg-surface)] p-3.5 transition-all duration-300 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]"
  >
    <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] shadow-[var(--shadow-sm)] transition-transform group-hover:scale-105">
      <div
        class="absolute inset-0 bg-cover bg-no-repeat bg-center"
        :style="{ backgroundImage: item.imageStyle || orderItemFallbackBackground }"
      />
      <div class="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg-media)_12%,transparent),transparent)]" />
    </div>

    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-black text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-primary)]">
            {{ displayOrderText(item.name) }}
          </p>
          <p class="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">
            {{ $t("orders.card.qtyCompact", { count: item.quantity }) }}
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm font-black tracking-tight text-[var(--text-primary)]">
            {{ formatOrderCurrency(item.price * item.quantity) }}
          </p>
          <p v-if="item.point" class="text-xs font-black text-[var(--text-brand)]">
            {{ formatOrderPoints(item.point * item.quantity) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import { useOrderDisplayText } from "../../application/composables/useOrderDisplayText"
import { orderItemFallbackBackground } from "../../application/composables/useOrderPresentation"
import type { OrderItem } from "../../domain/types/orders.types"

const props = withDefaults(defineProps<{
  item: OrderItem
  seller?: string
  paymentMethod?: string
  metaText?: string
  variant?: "compact" | "detail"
}>(), {
  seller: "",
  paymentMethod: "",
  metaText: "",
  variant: "compact",
})

const { t, locale } = useI18n()
const { displayOrderPaymentMethod, displayOrderText } = useOrderDisplayText()

const formatOrderCurrency = (value: number) =>
  formatCurrency(value, {
    currency: "VND",
    locale: locale.value,
  })

const formatOrderPoints = (value: number) =>
  `${new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 0,
  }).format(Math.max(0, value))} VNSEEA`

const detailMetaText = computed(() =>
  props.metaText
    || (props.seller
      ? t("orders.card.orderedFrom", {
          seller: props.seller,
          price: formatOrderCurrency(props.item.price),
        })
      : t("orders.card.unitPrice", {
          price: formatOrderCurrency(props.item.price),
        })),
)
</script>

<style scoped>
.order-item-article-detail {
  display: grid;
  gap: 24px;
  min-width: 0;
}

.order-item-image-wrapper {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--border-light);
  background-color: var(--bg-muted);
  box-shadow: var(--shadow-sm);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-item-image-wrapper:hover {
  transform: scale(1.02);
}

.order-item-image-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover .order-item-image-bg {
  transform: scale(1.1);
}

.order-item-article-detail p {
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .order-item-article-detail {
    grid-template-columns: 88px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    padding: 12px !important;
    border-radius: 14px;
  }

  .order-item-image-wrapper {
    width: 88px !important;
    height: 88px !important;
    margin: 0;
    border-radius: 12px;
  }

  .order-item-title {
    font-size: 14px !important;
    line-height: 1.2;
  }

  .order-item-meta {
    font-size: 9px !important;
    line-height: 1.25;
    letter-spacing: 0.04em !important;
  }

  .order-item-price {
    font-size: 15px !important;
    line-height: 1.2;
  }
}

@media (min-width: 768px) {
  .order-item-article-detail {
    grid-template-columns: 140px minmax(0, 1fr);
    align-items: start;
  }

  .order-item-image-wrapper {
    margin-left: 0;
    margin-right: 0;
    width: 140px !important;
    height: 140px !important;
    max-width: none !important;
  }
}
</style>
