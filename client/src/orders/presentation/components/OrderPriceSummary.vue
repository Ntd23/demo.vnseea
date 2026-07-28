<!-- English description: Order price summary card with shared locale-aware currency formatting. -->
<template>
  <div :class="cardClass">
    <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
      {{ $t("orders.summary.totalPayment") }}
    </p>

    <div class="mt-5 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <span class="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">{{ $t("orders.summary.subtotal") }}</span>
        <span class="text-sm font-black text-[var(--text-primary)]">{{ formatOrderCurrency(subtotal) }}</span>
      </div>
      <div class="flex items-center justify-between gap-4">
        <span class="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">{{ $t("orders.summary.shippingFee") }}</span>
        <span class="text-sm font-black text-[var(--text-primary)]">
          {{ order.shippingFee > 0 ? formatOrderCurrency(order.shippingFee) : $t("orders.summary.free") }}
        </span>
      </div>
      <div v-if="totalPoints > 0" class="flex items-center justify-between gap-4">
        <span class="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">{{ $t("orders.summary.totalPoints") }}</span>
        <span class="text-sm font-black text-[var(--text-brand)]">{{ formatOrderPoints(totalPoints) }}</span>
      </div>
    </div>

    <div class="mt-6 border-t border-[var(--border-light)]" />

    <div class="mt-6 flex items-end justify-between gap-4">
      <div class="space-y-1">
        <p class="pl-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          {{ $t("orders.summary.totalOrder") }}
        </p>
        <p class="text-3xl font-black leading-none tracking-tight text-[var(--text-primary)]">
          {{ formatOrderCurrency(order.total) }}
        </p>
        <p v-if="totalPoints > 0" class="text-sm font-black text-[var(--text-brand)]">
          {{ formatOrderPoints(totalPoints) }}
        </p>
      </div>

      <UBadge
        v-if="statusMeta"
        variant="soft"
        class="rounded-lg font-black text-[10px] uppercase tracking-widest px-3 py-1.5 ring-1 ring-inset"
        :class="statusMeta.badgeClass || statusMeta.panelClass"
      >
        {{ $t(statusMeta.label) }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import { useOrderPresentation } from "../../application/composables/useOrderPresentation"
import type { OrderPresentationShape } from "../../domain/types/orders.types"

const props = withDefaults(defineProps<{
  order: OrderPresentationShape
  cardClass?: string
}>(), {
  cardClass: "rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-surface)] px-4 py-4 shadow-[var(--shadow-sm)]",
})

const { subtotal, statusMeta } = useOrderPresentation(computed(() => props.order))
const { locale } = useI18n()
const totalPoints = computed(() =>
  props.order.totalPoints
  ?? props.order.items.reduce((sum, item) => sum + (item.point ?? 0) * item.quantity, 0),
)

const formatOrderCurrency = (value: number) =>
  formatCurrency(value, {
    currency: "VND",
    locale: locale.value,
  })

const formatOrderPoints = (value: number) =>
  `${new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 0,
  }).format(Math.max(0, value))} VNSEEA`
</script>
