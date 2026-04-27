<template>
  <article
    v-if="variant === 'detail'"
    class="surface-card group grid gap-6 p-5 transition-all duration-500 hover:bg-white hover:ring-primary-100 md:grid-cols-[140px_minmax(0,1fr)] md:items-start ring-1 ring-secondary-100 bg-secondary-50/10"
  >
    <div class="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl border border-secondary-100 bg-secondary-100 shadow-sm md:mx-0 md:h-[140px] md:w-[140px] md:max-w-none transition-transform duration-500 group-hover:scale-[1.02]">
      <div class="absolute inset-0 transition-transform duration-700 group-hover:scale-110" :style="{ background: item.imageStyle || orderItemFallbackBackground }" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <div class="absolute inset-0 ring-1 ring-inset ring-black/5" />
      
      <div class="absolute left-2.5 top-2.5 rounded-lg bg-black/60 shadow-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10 z-10">
        {{ variant === 'detail' ? $t('orders.card.itemLabel') : $t('orders.card.qtyCompact', { count: item.quantity }) }}
      </div>
    </div>

    <div class="min-w-0 flex-1 space-y-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 space-y-1">
          <p class="text-lg font-black text-secondary-900 tracking-tight group-hover:text-secondary-900 transition-colors">
            {{ $t(item.name) }}
          </p>
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-primary-500" />
            <p class="text-[11px] font-black uppercase tracking-widest text-secondary-400">
              {{ detailMetaText }}
            </p>
          </div>
        </div>

        <p class="text-xl font-black text-secondary-900 tracking-tight">
          {{ formatOrderCurrency(item.price * item.quantity) }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 pt-1">
        <UBadge color="white" variant="soft" class="rounded-lg bg-white ring-1 ring-secondary-100 px-3 py-1.5 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm">
          <Icon name="i-ph-hash-duotone" class="mr-1.5 h-3.5 w-3.5" />
          {{ $t("orders.card.qty", { count: item.quantity }) }}
        </UBadge>
        <UBadge v-if="paymentMethod" color="white" variant="soft" class="rounded-lg bg-white ring-1 ring-secondary-100 px-3 py-1.5 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm">
          <Icon name="i-ph-credit-card-duotone" class="mr-1.5 h-3.5 w-3.5" />
          {{ $t(paymentMethod) }}
        </UBadge>
      </div>
    </div>
  </article>

  <div
    v-else
    class="surface-card group flex gap-4 p-3.5 transition-all duration-300 ring-1 ring-secondary-100 bg-white hover:ring-primary-100 hover:shadow-lg"
  >
    <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-secondary-100 bg-secondary-100 shadow-sm transition-transform group-hover:scale-105">
      <div
        class="absolute inset-0"
        :style="{ background: item.imageStyle || orderItemFallbackBackground }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
    </div>

    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-black text-secondary-900 group-hover:text-secondary-900 transition-colors">
            {{ $t(item.name) }}
          </p>
          <p class="text-[10px] font-black uppercase tracking-widest text-secondary-900">
            {{ $t("orders.card.qtyCompact", { count: item.quantity }) }}
          </p>
        </div>

        <p class="text-sm font-black text-secondary-900 tracking-tight">
          {{ formatOrderCurrency(item.price * item.quantity) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { orderItemFallbackBackground } from "../../application/composables/useOrderPresentation"
import { formatOrderCurrency } from "../../domain/types/orders.types"
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

const { t } = useI18n()

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
