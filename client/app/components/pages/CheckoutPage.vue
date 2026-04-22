<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      :title="$t('checkout.page.layoutTitle')"
      :description="$t('checkout.page.layoutDescription')"
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
          @decrease-quantity="decreaseQuantity"
          @increase-quantity="increaseQuantity"
          @remove-item="removeItem"
        />
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import CheckoutLayout from "../checkout/CheckoutLayout.vue"
import CheckoutSummary from "../checkout/CheckoutSummary.vue"
import ShippingAddressFormUI from "../checkout/ShippingAddressFormUI.vue"
import type { CheckoutLineItem, SavedShippingAddress } from "~/types/checkout"

const { t } = useI18n()

useSeoMeta({
  title: t("checkout.page.title"),
  description: t("checkout.page.description"),
})

const cartItems = ref<CheckoutLineItem[]>([
  {
    id: "john-larry",
    name: "John Larry",
    price: 50000,
    quantity: 2,
    imageStyle: [
      "radial-gradient(circle at 72% 10%, rgba(255,216,188,0.52), transparent 20%)",
      "radial-gradient(circle at 20% 22%, rgba(255,255,255,0.3), transparent 23%)",
      "linear-gradient(145deg, #1c2d53 0%, #d28a9d 38%, #f6c58b 100%)",
    ].join(", "),
  },
])

const savedAddress = ref<SavedShippingAddress | null>(null)
const walletBalance = ref(40000)
const shippingFee = ref(0)

function handleAddressSubmit(address: SavedShippingAddress) {
  savedAddress.value = address
}

function increaseQuantity(itemId: string) {
  const item = cartItems.value.find(entry => entry.id === itemId)

  if (!item) {
    return
  }

  item.quantity += 1
}

function decreaseQuantity(itemId: string) {
  const item = cartItems.value.find(entry => entry.id === itemId)

  if (!item || item.quantity <= 1) {
    return
  }

  item.quantity -= 1
}

function removeItem(itemId: string) {
  cartItems.value = cartItems.value.filter(entry => entry.id !== itemId)
}
</script>
