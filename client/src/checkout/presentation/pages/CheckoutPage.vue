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
          @change-address="showAddressPicker = true"
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

    <AddressPickerModal
      v-model:open="showAddressPicker"
      :fetch-addresses="fetchSavedAddresses"
      @select="handlePickedAddress"
    />
  </div>
</template>

<script setup lang="ts">
import CheckoutLayout from "../components/CheckoutLayout.vue"
import CheckoutSummary from "../components/CheckoutSummary.vue"
import ShippingAddressFormUI from "../components/ShippingAddressFormUI.vue"
import AddressPickerModal from "../components/AddressPickerModal.vue"
import { useCheckoutPageVM } from "../../application/view-models/useCheckoutPageVM"
import type { SavedShippingAddress } from "../../domain/types/checkout.types"

const { t } = useI18n()
const showAddressPicker = ref(false)

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
  selectAddress,
  fetchSavedAddresses,
} = useCheckoutPageVM()

const handlePickedAddress = (address: SavedShippingAddress) => {
  selectAddress(address)
}
</script>
