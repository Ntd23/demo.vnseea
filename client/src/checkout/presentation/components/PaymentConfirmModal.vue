<!-- English description: Confirms the final checkout action before the real marketplace order is submitted. -->
<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="order-confirm">
        <div class="order-confirm__icon">
          <Icon name="i-ph-shopping-bag-open-fill" class="h-10 w-10" />
        </div>

        <h2>{{ $t("checkout.confirmModal.title", "Confirm order") }}</h2>
        <p>{{ $t("checkout.confirmModal.description", "You are about to purchase these items. Do you want to continue?") }}</p>

        <div class="order-confirm__summary" aria-live="polite">
          <span>{{ $t("checkout.summary.items", { count: totalItemsCount }) }}</span>
          <strong>{{ formatCheckoutCurrency(totalPayment) }}</strong>
        </div>

        <div class="order-confirm__actions">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="lg"
            class="order-confirm__button"
            @click="isOpen = false"
          >
            {{ $t("checkout.confirmModal.cancel", "Cancel") }}
          </UButton>

          <UButton
            type="button"
            color="primary"
            variant="solid"
            size="lg"
            icon="i-ph-check-circle-bold"
            class="order-confirm__button"
            @click="emit('confirm')"
          >
            {{ $t("checkout.confirmModal.confirm", "Place order") }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { formatCurrencyWithUnit } from "#shared-kernel/application/utils/formatCurrency"
import type { CheckoutCurrencyRule, CheckoutLineItem } from "../../domain/types/checkout.types"

const props = withDefaults(defineProps<{
  open: boolean
  items: CheckoutLineItem[]
  shippingFee?: number
  currency?: string
  currencySymbol?: string
  currencyRule?: CheckoutCurrencyRule
}>(), {
  shippingFee: 0,
  currency: "",
  currencySymbol: "",
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  confirm: []
}>()

const { locale } = useI18n()
const isOpen = computed({
  get: () => props.open,
  set: value => emit("update:open", value),
})

const totalItemsCount = computed(() => props.items.reduce((sum, item) => sum + item.quantity, 0))
const totalPayment = computed(() =>
  props.items.reduce((sum, item) => sum + (item.checkoutPrice ?? item.price) * item.quantity, 0) + props.shippingFee,
)

function formatCheckoutCurrency(value: number) {
  return formatCurrencyWithUnit(value, {
    currency: props.currency,
    currencySymbol: props.currencySymbol,
    currencyRule: props.currencyRule,
    locale: locale.value,
  })
}
</script>

<style scoped>
.order-confirm {
  width: min(500px, 100%);
  padding: 24px;
  text-align: center;
}

.order-confirm__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-success) 12%, var(--bg-surface));
  color: var(--text-success);
}

.order-confirm h2 {
  margin: 12px 0 0;
  color: var(--text-primary);
  font-size: 25px;
  font-weight: 800;
}

.order-confirm > p {
  margin: 18px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.55;
}

.order-confirm__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 14px;
}

.order-confirm__summary strong {
  color: var(--text-primary);
  font-size: 17px;
}

.order-confirm__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.order-confirm__button {
  justify-content: center;
  min-height: 44px;
  font-weight: 800;
}

@media (max-width: 480px) {
  .order-confirm {
    padding: 20px 16px;
  }
}
</style>
