<!-- English description: Renders a buyer order summary and actions. -->
<template>
  <article class="surface-card group overflow-hidden border border-[var(--border-light)] p-6 shadow-[var(--shadow-sm)] transition-all duration-500 hover:shadow-[var(--shadow-lg)] sm:p-8">
    <div class="flex flex-col gap-6 border-b border-[var(--border-light)] pb-6 xl:flex-row xl:items-start xl:justify-between">
      <div class="space-y-1">
        <div class="flex flex-wrap items-center gap-3">
          <p class="pl-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            {{ order.orderNumber }}
          </p>
          <UBadge
            variant="soft"
            class="rounded-lg px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] ring-1 ring-inset"
            :class="statusMeta.badgeClass"
          >
            <template #leading>
              <Icon :name="statusMeta.icon.includes('duotone') ? statusMeta.icon : statusMeta.icon.replace('-fill', '-duotone')" class="h-3.5 w-3.5 mr-1" />
            </template>
            {{ $t(statusMeta.label) }}
          </UBadge>
        </div>

        <h3 class="text-2xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)]">
          {{ order.seller }}
        </h3>
        <p class="max-w-2xl text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
          {{ $t(statusMeta.description) }}
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="flex flex-wrap gap-2 pt-2 xl:pt-1">
        <UBadge color="neutral" variant="soft" size="lg" class="rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-brand)]">
          {{ order.placedAt }}
        </UBadge>
        <UBadge color="neutral" variant="soft" size="lg" class="rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-brand)]">
          {{ $t("orders.card.items", { count: totalItems }) }}
        </UBadge>
        <UBadge color="neutral" variant="soft" size="lg" class="rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-brand)]">
          {{ displayOrderPaymentMethod(order.paymentMethod) }}
        </UBadge>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div class="space-y-8">
        <!-- Products Section -->
        <section class="surface-card group/section space-y-6 border border-[var(--border-light)] bg-[var(--bg-muted)] p-6 transition-colors duration-500 hover:bg-[var(--bg-surface-hover)]">
          <div class="flex items-center justify-between gap-4 border-b border-[var(--border-light)] pb-4">
            <p class="pl-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
              {{ $t("orders.card.productsInOrder") }}
            </p>
            <p class="text-[11px] font-semibold text-[var(--text-tertiary)] transition-colors group-hover/section:text-[var(--text-primary)]">
              {{ displayOrderText(order.deliveryWindow) }}
            </p>
          </div>

          <div class="space-y-4">
            <OrdersOrderItemCard
              v-for="item in order.items"
              :key="item.id"
              :item="item"
            />
          </div>
        </section>

        <!-- Shipping Section -->
        <section class="surface-card group/section space-y-4 border border-[var(--border-light)] bg-[var(--bg-muted)] p-6 transition-colors duration-500 hover:bg-[var(--bg-surface-hover)]">
          <p class="pl-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            {{ $t("orders.card.shippingAddress") }}
          </p>
          <div class="flex gap-3 items-start">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]">
              <Icon name="i-ph-map-pin-duotone" class="h-4 w-4" />
            </div>
            <p class="text-sm font-semibold leading-relaxed text-[var(--text-secondary)] transition-colors group-hover/section:text-[var(--text-primary)]">
              {{ order.shippingAddress }}
            </p>
          </div>
        </section>
      </div>

      <aside class="space-y-8">
        <!-- Price Summary Integrated -->
        <OrdersOrderPriceSummary
          :order="order"
          card-class="surface-card border border-[var(--border-light)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-lg)]"
        />

        <!-- Progress Tracking -->
        <section class="surface-card space-y-6 border border-[var(--border-light)] bg-[var(--bg-surface)] p-6">
          <p class="pl-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            {{ $t("orders.card.orderProgress") }}
          </p>

          <div class="space-y-5">
            <div
              v-for="(step, index) in progressSteps"
              :key="step.label"
              class="flex items-start gap-4"
            >
              <div
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-500"
                :class="index <= activeProgressStep ? 'bg-[var(--bg-brand)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] ring-1 ring-[var(--border-strong)]' : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] ring-1 ring-[var(--border-light)]'"
              >
                <Icon v-if="index < activeProgressStep" name="i-ph-check-bold" class="h-3 w-3" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="min-w-0 space-y-0.5">
                <p class="text-xs font-semibold transition-colors" :class="index <= activeProgressStep ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'">{{ $t(step.label) }}</p>
                <p class="text-[10px] font-medium leading-relaxed transition-colors" :class="index <= activeProgressStep ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'">{{ $t(step.description) }}</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <!-- Primary Actions -->
    <div class="mt-10 flex flex-wrap gap-3 border-t border-[var(--border-light)] pt-8">
      <UButton
        :to="appRoutes.orderDetail(order.id)"
        size="xl"
        icon="i-ph-arrow-square-out-duotone"
        class="rounded-xl bg-[var(--bg-brand)] px-8 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] transition-all hover:bg-[var(--bg-brand-hover)] active:scale-95"
      >
        {{ $t("orders.card.viewDetail") }}
      </UButton>

      <UButton
        color="white"
        variant="soft"
        size="xl"
        icon="i-ph-chat-circle-dots-duotone"
        class="rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] px-6 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-primary)] shadow-sm transition-all hover:bg-[var(--bg-surface-hover)] active:scale-95"
      >
        {{ $t("orders.card.contactShop") }}
      </UButton>

      <UButton
        :to="appRoutes.products"
        color="white"
        variant="soft"
        size="xl"
        icon="i-ph-shopping-cart-duotone"
        class="rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] px-6 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-surface-hover)] active:scale-95"
      >
        {{ $t(repeatActionLabel) }}
      </UButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import {
  getRepeatOrderActionLabel,
  useOrderPresentation,
} from "../../application/composables/useOrderPresentation"
import { useOrderDisplayText } from "../../application/composables/useOrderDisplayText"
import type { BuyerOrder } from "../../domain/types/orders.types"
import OrdersOrderItemCard from "./OrderItemCard.vue"
import OrdersOrderPriceSummary from "./OrderPriceSummary.vue"

const props = defineProps<{
  order: BuyerOrder
}>()

const { statusMeta, totalItems, activeProgressStep } = useOrderPresentation(computed(() => props.order))
const { displayOrderPaymentMethod, displayOrderText } = useOrderDisplayText()

const progressSteps = [
  {
    label: "orders.steps.placed.label",
    description: "orders.steps.placed.description",
  },
  {
    label: "orders.steps.processing.label",
    description: "orders.steps.processing.description",
  },
  {
    label: "orders.steps.shipping.label",
    description: "orders.steps.shipping.description",
  },
  {
    label: "orders.steps.completed.label",
    description: "orders.steps.completed.description",
  },
] as const

const repeatActionLabel = computed(() => getRepeatOrderActionLabel(props.order.status))
</script>
