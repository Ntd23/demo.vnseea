<template>
  <article class="surface-card group overflow-hidden p-6 sm:p-8 ring-1 ring-secondary-100 shadow-xl transition-all duration-500 hover:shadow-2xl">
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

        <h3 class="text-2xl font-black tracking-tight text-secondary-900 leading-tight">
          {{ order.seller }}
        </h3>
        <p v-if="statusMeta" class="text-sm font-medium leading-relaxed text-secondary-500 max-w-2xl">
          {{ $t(statusMeta.description) }}
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="flex flex-wrap gap-2 pt-2 xl:pt-1">
        <UBadge color="white" variant="soft" size="lg" class="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100">
          {{ order.placedAt }}
        </UBadge>
        <UBadge color="white" variant="soft" size="lg" class="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100">
          {{ $t("orders.card.items", { count: totalItems }) }}
        </UBadge>
        <UBadge color="white" variant="soft" size="lg" class="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100">
          {{ $t(order.paymentMethod) }}
        </UBadge>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div class="space-y-8">
        <!-- Products Section -->
        <section class="surface-card p-6 bg-secondary-50/30 ring-1 ring-secondary-100 space-y-6 group/section hover:bg-white transition-colors duration-500">
          <div class="flex items-center justify-between gap-4 border-b border-secondary-100 pb-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
              {{ $t("orders.card.productsInOrder") }}
            </p>
            <p class="text-[11px] font-black uppercase tracking-tight text-secondary-400 group-hover/section:text-secondary-900 transition-colors">
              {{ $t(order.deliveryWindow) }}
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
        <section class="surface-card p-6 bg-secondary-50/30 ring-1 ring-secondary-100 space-y-4 group/section hover:bg-white transition-colors duration-500">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
            {{ $t("orders.card.shippingAddress") }}
          </p>
          <div class="flex gap-3 items-start">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-secondary-100 text-secondary-900">
              <Icon name="i-ph-map-pin-duotone" class="h-4 w-4" />
            </div>
            <p class="text-sm font-semibold leading-relaxed text-secondary-600 group-hover/section:text-secondary-900 transition-colors">
              {{ order.shippingAddress }}
            </p>
          </div>
        </section>
      </div>

      <aside class="space-y-8">
        <!-- Price Summary Integrated -->
        <OrdersOrderPriceSummary
          :order="order"
          card-class="surface-card p-6 bg-gradient-to-br from-primary-50 to-white ring-1 ring-primary-100 shadow-lg"
        />

        <!-- Progress Tracking -->
        <section class="surface-card p-6 ring-1 ring-secondary-100 bg-white space-y-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900 pl-1">
            {{ $t("orders.card.orderProgress") }}
          </p>

          <div class="space-y-5">
            <div
              v-for="(step, index) in progressSteps"
              :key="step.label"
              class="flex items-start gap-4"
            >
              <div
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-all duration-500"
                :class="index <= activeProgressStep ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-1 ring-primary-500' : 'bg-secondary-50 text-secondary-300 ring-1 ring-secondary-100'"
              >
                <Icon v-if="index < activeProgressStep" name="i-ph-check-bold" class="h-3 w-3" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="min-w-0 space-y-0.5">
                <p class="text-xs font-black transition-colors" :class="index <= activeProgressStep ? 'text-secondary-900' : 'text-secondary-300'">{{ $t(step.label) }}</p>
                <p class="text-[10px] font-medium leading-relaxed transition-colors" :class="index <= activeProgressStep ? 'text-secondary-500' : 'text-secondary-300'">{{ $t(step.description) }}</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <!-- Primary Actions -->
    <div class="mt-10 flex flex-wrap gap-3 border-t border-secondary-50 pt-8">
      <UButton
        :to="`/order/${order.id}`"
        size="xl"
        icon="i-ph-arrow-square-out-duotone"
        class="rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest px-8 shadow-xl shadow-primary-500/30 transition-all active:scale-95"
      >
        {{ $t("orders.card.viewDetail") }}
      </UButton>

      <UButton
        color="white"
        variant="soft"
        size="xl"
        icon="i-ph-chat-circle-dots-duotone"
        class="rounded-2xl border border-secondary-200 bg-white hover:bg-secondary-50 text-secondary-900 font-black text-xs uppercase tracking-widest px-6 shadow-sm transition-all active:scale-95"
      >
        {{ $t("orders.card.contactShop") }}
      </UButton>

      <UButton
        to="/products"
        color="white"
        variant="soft"
        size="xl"
        icon="i-ph-shopping-cart-duotone"
        class="rounded-2xl border border-secondary-200 bg-secondary-50/50 hover:bg-secondary-100 text-secondary-600 font-black text-xs uppercase tracking-widest px-6 transition-all active:scale-95"
      >
        {{ $t(repeatActionLabel) }}
      </UButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  getRepeatOrderActionLabel,
  useOrderPresentation,
} from "../../application/composables/useOrderPresentation"
import type { BuyerOrder } from "../../domain/types/orders.types"
import OrdersOrderItemCard from "./OrdersOrderItemCard.vue"
import OrdersOrderPriceSummary from "./OrdersOrderPriceSummary.vue"

const props = defineProps<{
  order: BuyerOrder
}>()

const { statusMeta, totalItems, activeProgressStep } = useOrderPresentation(computed(() => props.order))

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


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

