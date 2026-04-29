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
          :initial-address="savedAddress"
          @submit="handleAddressSubmit"
        />
      </template>

      <template #right>
        <CheckoutSummary
          :items="cartItems"
          :shipping-fee="shippingFee"
          :wallet-balance="walletBalance"
          :address-ready="hasSavedAddress"
          :checkout-state="checkoutState"
          @decrease-quantity="decreaseQuantity"
          @increase-quantity="increaseQuantity"
          @remove-item="removeItem"
          @submit="handleCheckoutAction"
        />
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import CheckoutLayout from "../components/CheckoutLayout.vue"
import CheckoutSummary from "../components/CheckoutSummary.vue"
import ShippingAddressFormUI from "../components/ShippingAddressFormUI.vue"
import { useCheckoutPageVM } from "../../application/view-models/useCheckoutPageVM"

const { t } = useI18n()
const {
  cartItems,
  savedAddress,
  walletBalance,
  shippingFee,
  checkoutState,
  progressText,
  progressValue,
  hasSavedAddress,
  handleAddressSubmit,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  handleCheckoutAction,
} = useCheckoutPageVM()
</script>
