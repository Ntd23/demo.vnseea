<!-- English description: Displays the checkout cart, quantity controls, total, and place-order action. -->
<template>
  <section class="order-card" aria-labelledby="order-card-title">
    <div class="order-card__header">
      <div class="order-card__heading">
        <span class="order-card__icon">
          <Icon name="i-ph-shopping-cart-simple-fill" class="h-5 w-5" />
        </span>
        <div>
          <h2 id="order-card-title">{{ $t("checkout.summary.title") }}</h2>
        </div>
      </div>
    </div>

    <template v-if="items.length">
      <div class="order-card__items">
        <article v-for="item in items" :key="item.id" class="order-item">
          <div class="order-item__media">
            <div
              v-if="!item.imageUrl"
              class="order-item__fallback"
              :style="{ backgroundImage: item.imageStyle || defaultCardBackground }"
            />
            <NuxtImg
              v-else
              :src="item.imageUrl"
              :alt="item.name"
              class="order-item__image"
              loading="lazy"
            />

            <UButton
              type="button"
              color="neutral"
              variant="solid"
              icon="i-ph-x-bold"
              size="xs"
              class="order-item__remove"
              :aria-label="$t('checkout.summary.removeItemAria', { name: item.name })"
              @click="emit('removeItem', item.id)"
            />
          </div>

          <div class="order-item__body">
            <h3>{{ item.name }}</h3>
            <p class="order-item__price">
              {{ formatLineItemCurrency(item) }}
            </p>

            <div class="order-item__quantity">
              <span>{{ $t("checkout.summary.qty") }}</span>
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                icon="i-ph-minus-bold"
                size="xs"
                :disabled="isBusy || item.quantity <= 1"
                :aria-label="$t('checkout.summary.decreaseQuantityAria', { name: item.name })"
                @click.stop="emit('decreaseQuantity', item.id)"
              />
              <strong :aria-label="$t('checkout.summary.quantityValue', { count: item.quantity })">
                {{ item.quantity }}
              </strong>
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                icon="i-ph-plus-bold"
                size="xs"
                :disabled="isBusy || hasReachedStockLimit(item)"
                :title="hasReachedStockLimit(item) ? stockLimitLabel(item) : undefined"
                :aria-label="$t('checkout.summary.increaseQuantityAria', { name: item.name })"
                @click.stop="emit('increaseQuantity', item.id)"
              />
            </div>
          </div>
        </article>
      </div>

      <div class="order-card__totals">
        <div v-if="shippingFee > 0" class="order-card__total-row">
          <span>{{ $t("checkout.summary.shippingFee") }}</span>
          <span>{{ formatCheckoutCurrency(shippingFee) }}</span>
        </div>
        <div class="order-card__grand-total">
          <span>{{ $t("checkout.summary.totalPayment") }}</span>
          <strong>{{ formatCheckoutCurrency(total) }}</strong>
        </div>
      </div>

      <UAlert
        v-if="statusAlert"
        :color="statusAlert.color"
        variant="subtle"
        :icon="statusAlert.icon"
        :title="statusAlert.title"
        :description="statusAlert.description"
        class="order-card__alert"
        aria-live="polite"
      />

      <div class="order-card__footer">
        <UButton
          type="button"
          color="primary"
          variant="solid"
          size="lg"
          icon="i-ph-shopping-bag-open-bold"
          class="order-card__submit"
          :loading="isBusy"
          :disabled="ctaDisabled"
          @click="emit('submit')"
        >
          {{ ctaLabel }}
        </UButton>
      </div>
    </template>

    <div v-else class="order-card__empty">
      <Icon name="i-ph-shopping-cart-simple" class="h-8 w-8" />
      <h3>{{ $t("checkout.summary.emptyCart") }}</h3>
      <p>{{ $t("checkout.summary.emptyCartHint") }}</p>
      <UButton :to="appRoutes.products" color="primary" variant="outline">
        {{ $t("checkout.summary.backToMarketplace") }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrencyWithUnit } from "#shared-kernel/application/utils/formatCurrency"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import type { CheckoutCurrencyRule, CheckoutLineItem } from "../../domain/types/checkout.types"

const props = withDefaults(defineProps<{
  items: CheckoutLineItem[]
  shippingFee?: number
  currency?: string
  currencySymbol?: string
  currencyRule?: CheckoutCurrencyRule
  addressReady?: boolean
  checkoutState?: "idle" | "loading" | "success" | "error"
}>(), {
  shippingFee: 0,
  currency: "",
  currencySymbol: "",
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
const defaultCardBackground = "linear-gradient(145deg, #dbeafe, #fce7f3)"

const itemCount = computed(() => props.items.reduce((sum, item) => sum + item.quantity, 0))
const itemCountLabel = computed(() => t("checkout.summary.items", { count: itemCount.value }))
const subtotal = computed(() => props.items.reduce(
  (sum, item) => sum + (item.checkoutPrice ?? item.price) * item.quantity,
  0,
))
const total = computed(() => subtotal.value + props.shippingFee)
const isBusy = computed(() => props.checkoutState === "loading")

const statusAlert = computed(() => {
  if (props.checkoutState === "error" && props.addressReady) {
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

  return null
})

const ctaLabel = computed(() => {
  if (props.checkoutState === "loading") return t("checkout.summary.processing")
  if (props.checkoutState === "success") return t("checkout.summary.orderPlaced")
  return t("checkout.summary.buy")
})

const ctaDisabled = computed(() =>
  props.items.length === 0
  || props.checkoutState === "loading"
  || props.checkoutState === "success",
)

function formatCheckoutCurrency(value: number) {
  return formatCurrencyWithUnit(value, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })
}

function formatLineItemCurrency(item: CheckoutLineItem) {
  return formatCurrencyWithUnit(item.price * item.quantity, {
    currency: item.currency || props.currency,
    currencySymbol: item.currencySymbol || props.currencySymbol,
    currencyRule: item.currencyRule || props.currencyRule,
    locale: locale.value,
  })
}

function hasReachedStockLimit(item: CheckoutLineItem) {
  return item.maxQuantity !== undefined
    && item.maxQuantity > 0
    && item.quantity >= item.maxQuantity
}

function stockLimitLabel(item: CheckoutLineItem) {
  return t("pages.productEditor.stockUnits", { count: item.maxQuantity ?? item.quantity })
}
</script>

<style scoped>
.order-card {
  overflow: hidden;
  border: 1px solid #dfe6f3;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 14px rgb(31 51 92 / 7%);
}

.order-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
}

.order-card__heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-card__heading h2,
.order-card__heading p {
  margin: 0;
}

.order-card__heading h2 {
  color: var(--color-secondary-900);
  font-size: 19px;
  font-weight: 800;
}

.order-card__heading p {
  margin-top: 2px;
  color: var(--color-secondary-600);
  font-size: 13px;
}

.order-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1b9ef3;
  color: #fff;
}

.order-card__store-link {
  color: var(--color-secondary-600);
  font-weight: 600;
}

.order-card__items {
  display: grid;
  gap: 16px;
  padding: 14px 24px 24px;
}

.order-item {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 16px;
}

.order-item__media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  background: var(--color-secondary-100);
}

.order-item__image,
.order-item__fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-position: center;
  background-size: cover;
}

.order-item__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  border-radius: 50%;
}

.order-item__body {
  min-width: 0;
  align-self: center;
}

.order-item__body h3,
.order-item__price {
  margin: 0;
}

.order-item__body h3 {
  overflow-wrap: anywhere;
  color: var(--color-secondary-900);
  font-size: 16px;
  font-weight: 700;
}

.order-item__price {
  margin-top: 5px;
  color: var(--color-secondary-600);
  font-weight: 700;
}

.order-item__quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: var(--color-secondary-600);
  font-size: 13px;
}

.order-item__quantity strong {
  min-width: 20px;
  text-align: center;
  color: var(--color-secondary-900);
}

.order-card__totals {
  margin: 0 24px;
  padding: 20px 0;
  border-top: 1px solid var(--color-secondary-200);
  border-bottom: 1px solid var(--color-secondary-200);
}

.order-card__total-row,
.order-card__grand-total {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.order-card__total-row {
  margin-bottom: 12px;
  color: var(--color-secondary-600);
  font-size: 14px;
}

.order-card__grand-total {
  align-items: flex-end;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
}

.order-card__grand-total span {
  color: var(--color-secondary-700);
  font-size: 16px;
  font-weight: 700;
}

.order-card__grand-total strong {
  color: var(--color-secondary-900);
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 500;
}

.order-card__alert {
  margin: 18px 24px 0;
}

.order-card__footer {
  display: flex;
  justify-content: flex-end;
  padding: 24px;
}

.order-card__submit {
  min-width: 190px;
  justify-content: center;
  background: #8bcf8d;
  font-weight: 800;
}

.order-card__submit:hover:not(:disabled) {
  background: #73bd77;
}

.order-card__empty {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--color-secondary-500);
  text-align: center;
}

.order-card__empty h3,
.order-card__empty p {
  margin: 0;
}

@media (max-width: 560px) {
  .order-card__header {
    align-items: flex-start;
    padding: 16px;
  }

  .order-card__store-link {
    padding-inline: 0;
  }

  .order-card__items {
    padding: 10px 16px 20px;
  }

  .order-item {
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 12px;
  }

  .order-card__totals {
    margin-inline: 16px;
  }

  .order-card__alert {
    margin-inline: 16px;
  }

  .order-card__footer {
    padding: 20px 16px;
  }

  .order-card__submit {
    width: 100%;
  }
}
</style>
