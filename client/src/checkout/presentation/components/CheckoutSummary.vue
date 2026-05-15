<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white shadow-sm"
    aria-labelledby="checkout-summary-title"
  >
    <div class="p-5 sm:p-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-5">
        <h2 id="checkout-summary-title" class="text-xl font-bold text-slate-900 tracking-tight">
          {{ $t("checkout.summary.title") }}
          <span class="text-slate-500 font-medium text-sm ml-2">({{ itemLabel }})</span>
        </h2>
        <UButton
          :to="appRoutes.products"
          color="neutral"
          variant="link"
          class="text-sm font-medium"
          :padded="false"
        >
          {{ $t("checkout.summary.backToStore") }}
        </UButton>
      </div>

      <!-- Alerts -->
      <UAlert
        v-if="statusAlert"
        :color="statusAlert.color"
        variant="subtle"
        :icon="statusAlert.icon"
        :title="statusAlert.title"
        :description="statusAlert.description"
        class="mt-5 rounded-xl"
        aria-live="polite"
      />

      <div v-if="items.length" class="mt-6">
        <!-- Status -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {{ $t("checkout.summary.addressStatusLabel") }}
            </p>
            <p class="text-sm font-bold" :class="addressReady ? 'text-green-600' : 'text-amber-600'">
              {{ addressReady ? $t("checkout.summary.addressReady") : $t("checkout.summary.addressMissing") }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {{ $t("checkout.summary.walletStatusLabel") }}
            </p>
            <p class="text-sm font-bold" :class="walletShortage > 0 ? 'text-amber-600' : 'text-green-600'">
              {{ walletShortage > 0
                ? $t("checkout.summary.walletShortage", { amount: formatVnd(walletShortage) })
                : $t("checkout.summary.walletReady") }}
            </p>
          </div>
        </div>

        <!-- Items -->
        <div class="space-y-4 mb-6">
          <article
            v-for="item in items"
            :key="item.id"
            class="flex gap-4 group"
          >
            <div class="relative h-24 w-24 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
              <div
                v-if="!item.imageUrl"
                class="absolute inset-0 opacity-50"
                :style="{ background: item.imageStyle || defaultCardBackground }"
              />
              <NuxtImg
                v-else
                :src="item.imageUrl"
                :alt="item.name"
                class="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div class="flex flex-1 flex-col justify-between py-1 min-w-0">
              <div class="flex justify-between items-start gap-4">
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-slate-900 truncate">
                    {{ item.name }}
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">{{ $t("checkout.summary.marketplace") }}</p>
                </div>
                <button
                  type="button"
                  class="text-slate-400 hover:text-red-600 transition-colors"
                  :aria-label="$t('checkout.summary.removeItemAria', { name: item.name })"
                  @click="emit('removeItem', item.id)"
                >
                  <Icon name="i-ph-trash" class="h-4 w-4" />
                </button>
              </div>

              <div class="flex items-center justify-between mt-2">
                <div class="text-sm font-bold text-slate-900">
                  {{ formatVnd(item.price) }}
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="h-6 w-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    :disabled="item.quantity <= 1 || isBusy"
                    :aria-label="$t('checkout.summary.decreaseQuantityAria', { name: item.name })"
                    @click="emit('decreaseQuantity', item.id)"
                  >
                    <Icon name="i-ph-minus" class="h-3 w-3" />
                  </button>
                  <span class="text-sm font-medium w-4 text-center">{{ item.quantity }}</span>
                  <button
                    type="button"
                    class="h-6 w-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    :disabled="isBusy"
                    :aria-label="$t('checkout.summary.increaseQuantityAria', { name: item.name })"
                    @click="emit('increaseQuantity', item.id)"
                  >
                    <Icon name="i-ph-plus" class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="border-t border-slate-200 pt-5 space-y-3">
          <div class="flex justify-between text-sm text-slate-600">
            <span>{{ $t("checkout.summary.subtotal") }}</span>
            <span class="font-medium text-slate-900">{{ formatVnd(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm text-slate-600">
            <span>{{ $t("checkout.summary.shippingFee") }}</span>
            <span class="font-medium text-slate-900">{{ shippingFee > 0 ? formatVnd(shippingFee) : $t("checkout.summary.free") }}</span>
          </div>
          
          <div class="flex justify-between items-end pt-3">
            <div>
              <p class="text-sm font-bold text-slate-900">{{ $t("checkout.summary.totalPayment") }}</p>
              <p class="text-xs text-slate-500 mt-0.5 max-w-[200px] leading-snug">{{ paymentHint }}</p>
            </div>
            <p class="text-2xl font-bold text-[var(--color-primary-600)]">{{ formatVnd(total) }}</p>
          </div>
        </div>

        <div class="mt-6 pt-5 border-t border-slate-200">
          <UButton
            color="primary"
            variant="solid"
            block
            size="lg"
            :loading="isBusy"
            :disabled="ctaDisabled"
            class="h-12 text-[15px] font-bold rounded-xl"
            @click="emit('submit')"
          >
            {{ ctaLabel }}
          </UButton>
        </div>
      </div>

      <div
        v-else
        class="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"
      >
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icon name="i-ph-shopping-cart-simple" class="h-6 w-6" />
        </div>
        <h3 class="mt-4 text-sm font-semibold text-slate-900">
          {{ $t("checkout.summary.emptyCart") }}
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          {{ $t("checkout.summary.emptyCartHint") }}
        </p>
        <UButton
          :to="appRoutes.products"
          color="primary"
          variant="outline"
          class="mt-4 rounded-lg"
        >
          {{ $t("checkout.summary.backToMarketplace") }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import type { CheckoutLineItem } from "../../domain/types/checkout.types"

const props = withDefaults(defineProps<{
  items: CheckoutLineItem[]
  walletBalance: number
  shippingFee?: number
  addressReady?: boolean
  checkoutState?: "idle" | "loading" | "success" | "error"
}>(), {
  shippingFee: 0,
  addressReady: false,
  checkoutState: "idle",
})

const emit = defineEmits<{
  increaseQuantity: [itemId: string]
  decreaseQuantity: [itemId: string]
  removeItem: [itemId: string]
  submit: []
}>()

const { t, locale } = useI18n()

const defaultCardBackground = [
  "radial-gradient(circle at 78% 12%, rgba(255,214,182,0.5), transparent 18%)",
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.26), transparent 22%)",
  "linear-gradient(150deg, #243b63 0%, #f1959b 42%, #f8c184 100%)",
].join(", ")

const subtotal = computed(() =>
  props.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
)

const total = computed(() => subtotal.value + props.shippingFee)

const itemLabel = computed(() => {
  const count = props.items.length
  return t(count === 1 ? "checkout.summary.items" : "checkout.summary.itemsPlural", { count })
})

const walletShortage = computed(() => Math.max(total.value - props.walletBalance, 0))
const isBusy = computed(() => props.checkoutState === "loading")

const statusAlert = computed(() => {
  if (props.items.length === 0) {
    return null
  }

  if (props.checkoutState === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("checkout.summary.purchaseSuccessTitle"),
      description: t("checkout.summary.purchaseSuccessDescription"),
    }
  }

  if (props.checkoutState === "error") {
    return {
      color: "error" as const,
      icon: "i-ph-warning-circle-fill",
      title: t("checkout.summary.purchaseErrorTitle"),
      description: t("checkout.summary.purchaseErrorDescription"),
    }
  }

  if (!props.addressReady) {
    return {
      color: "warning" as const,
      icon: "i-ph-map-pin-fill",
      title: t("checkout.summary.addressRequiredTitle"),
      description: t("checkout.summary.addressRequiredDescription"),
    }
  }

  if (walletShortage.value > 0) {
    return {
      color: "warning" as const,
      icon: "i-ph-wallet-fill",
      title: t("checkout.summary.walletAttentionTitle"),
      description: t("checkout.summary.insufficientBalance"),
    }
  }

  return {
    color: "success" as const,
    icon: "i-ph-seal-check-fill",
    title: t("checkout.summary.readyTitle"),
    description: t("checkout.summary.readyDescription"),
  }
})

const ctaLabel = computed(() => {
  if (!props.addressReady) {
    return t("checkout.summary.saveAddressFirst")
  }

  if (props.checkoutState === "loading") {
    return t("checkout.summary.processing")
  }

  if (props.checkoutState === "success") {
    return t("checkout.summary.orderPlaced")
  }

  if (props.checkoutState === "error") {
    return t("checkout.summary.retry")
  }

  if (walletShortage.value > 0) {
    return t("checkout.summary.addFunds")
  }

  return t("checkout.summary.buy")
})

const ctaDisabled = computed(() =>
  props.items.length === 0
  || !props.addressReady
  || props.checkoutState === "loading"
  || props.checkoutState === "success",
)

const paymentHint = computed(() => {
  if (!props.addressReady) {
    return t("checkout.summary.addressMissingHint")
  }

  if (walletShortage.value > 0) {
    return t("checkout.summary.walletBalance", {
      balance: formatVnd(props.walletBalance),
      amount: formatVnd(walletShortage.value),
    })
  }

  return t("checkout.summary.walletHint", {
    balance: formatVnd(props.walletBalance),
  })
})

function formatVnd(value: number) {
  return formatCurrency(value, {
    currency: "VND",
    locale: locale.value,
  })
}
</script>
