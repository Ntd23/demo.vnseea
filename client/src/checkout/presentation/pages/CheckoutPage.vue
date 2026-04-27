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
import { useStorage } from "@vueuse/core"
import CheckoutLayout from "../components/CheckoutLayout.vue"
import CheckoutSummary from "../components/CheckoutSummary.vue"
import ShippingAddressFormUI from "../components/ShippingAddressFormUI.vue"
import type { CheckoutLineItem, SavedShippingAddress } from "../../domain/types/checkout.types"

const { t } = useI18n()
const toast = useToast()

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

const savedAddress = useStorage<SavedShippingAddress | null>(
  "checkout:saved-address",
  null,
  undefined,
  { initOnMounted: true },
)
const walletBalance = ref(40000)
const shippingFee = ref(0)
const checkoutState = ref<"idle" | "loading" | "success" | "error">("idle")

const subtotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
)

const total = computed(() => subtotal.value + shippingFee.value)
const walletShortage = computed(() => Math.max(total.value - walletBalance.value, 0))
const hasSavedAddress = computed(() => Boolean(savedAddress.value))

const checkoutStepCount = 3
const readyStepCount = computed(() =>
  [
    hasSavedAddress.value,
    cartItems.value.length > 0,
    walletShortage.value === 0,
  ].filter(Boolean).length,
)

const progressValue = computed(() => (readyStepCount.value / checkoutStepCount) * 100)
const progressText = computed(() =>
  t("checkout.page.progressStatus", {
    ready: readyStepCount.value,
    total: checkoutStepCount,
  }),
)

function handleAddressSubmit(address: SavedShippingAddress) {
  savedAddress.value = { ...address }
  resetCheckoutState()
}

function increaseQuantity(itemId: string) {
  const item = cartItems.value.find(entry => entry.id === itemId)

  if (!item) {
    return
  }

  item.quantity += 1
  resetCheckoutState()
}

function decreaseQuantity(itemId: string) {
  const item = cartItems.value.find(entry => entry.id === itemId)

  if (!item || item.quantity <= 1) {
    return
  }

  item.quantity -= 1
  resetCheckoutState()
}

function removeItem(itemId: string) {
  cartItems.value = cartItems.value.filter(entry => entry.id !== itemId)
  resetCheckoutState()
}

async function handleCheckoutAction() {
  if (!cartItems.value.length) {
    return
  }

  if (!savedAddress.value) {
    checkoutState.value = "error"

    toast.add({
      title: t("checkout.summary.addressRequiredTitle"),
      description: t("checkout.summary.addressRequiredDescription"),
      color: "warning",
    })

    return
  }

  if (walletShortage.value > 0) {
    const shortageAmount = walletShortage.value

    walletBalance.value += shortageAmount

    toast.add({
      title: t("checkout.summary.topUpSuccessTitle"),
      description: t("checkout.summary.topUpSuccessDescription", {
        amount: formatVnd(shortageAmount),
      }),
      color: "success",
    })

    resetCheckoutState()
    return
  }

  checkoutState.value = "loading"

  await new Promise(resolve => setTimeout(resolve, 700))

  checkoutState.value = "success"

  toast.add({
    title: t("checkout.summary.purchaseSuccessTitle"),
    description: t("checkout.summary.purchaseSuccessDescription"),
    color: "success",
  })
}

function resetCheckoutState() {
  if (checkoutState.value !== "loading") {
    checkoutState.value = "idle"
  }
}

function formatVnd(value: number) {
  return `VND${value.toLocaleString("en-US")}`
}
</script>
