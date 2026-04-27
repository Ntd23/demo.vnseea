<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      :title="$t('checkout.page.layoutTitle')"
      :description="$t('checkout.page.layoutDescription')"
      :left-label="$t('checkout.page.formRegion')"
      :right-label="$t('checkout.page.summaryRegion')"
      :progress-label="$t('checkout.page.progressLabel')"
      :progress-text="progressText"
      :progress-value="progressValue"
    >
      <template #left>
        <ShippingAddressFormUI
          :initial-address="snapshot.shippingAddress"
          @submit="updateShippingAddress"
        />
      </template>

      <template #right>
        <CheckoutSummary
          :items="snapshot.items"
          :shipping-fee="snapshot.shippingFee"
          :wallet-balance="snapshot.walletBalance"
          :address-ready="shippingValidation.valid"
          :checkout-state="status"
          @decrease-quantity="decreaseQuantity"
          @increase-quantity="increaseQuantity"
          @remove-item="removeItem"
          @submit="submit"
        />
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import CheckoutLayout from "../components/CheckoutLayout.vue"
import CheckoutSummary from "../components/CheckoutSummary.vue"
import ShippingAddressFormUI from "../components/ShippingAddressFormUI.vue"
import { useCheckoutFlow } from "../../application/composables/useCheckoutFlow"
import { createCheckoutSnapshot } from "../../application/use-cases/create-checkout-snapshot"

const { t } = useI18n()

const {
  snapshot,
  status,
  shippingValidation,
  progressValue,
  progressText,
  updateShippingAddress,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  submit,
} = useCheckoutFlow(
  "checkout:saved-address",
  createCheckoutSnapshot(),
)
</script>
