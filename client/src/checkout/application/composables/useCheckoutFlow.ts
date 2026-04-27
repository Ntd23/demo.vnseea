import { computed, ref } from "vue"
import { validateShippingAddress } from "../../domain/specifications/shipping-address.specification"
import type { CheckoutSnapshot, ShippingAddress } from "../../domain/types/checkout.types"
import { saveShippingAddress as persistShippingAddress } from "../../infrastructure/persistence/checkout.storage"

export const useCheckoutFlow = (
  storageKey: string,
  initialSnapshot: CheckoutSnapshot,
) => {
  const { t } = useI18n()
  const toast = useToast()
  
  const snapshot = ref<CheckoutSnapshot>(JSON.parse(JSON.stringify(initialSnapshot)) as CheckoutSnapshot)
  const status = ref<"idle" | "loading" | "success" | "error">("idle")

  const subtotal = computed(() =>
    snapshot.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const total = computed(() => subtotal.value + snapshot.value.shippingFee)
  
  const walletShortage = computed(() => Math.max(total.value - snapshot.value.walletBalance, 0))

  const shippingValidation = computed(() =>
    snapshot.value.shippingAddress
      ? validateShippingAddress(snapshot.value.shippingAddress)
      : { valid: false, errors: [t("checkout.status.addressRequired")] },
  )

  const updateShippingAddress = (address: ShippingAddress) => {
    snapshot.value.shippingAddress = { ...address }
    resetStatus()
    persistShippingAddress(storageKey, address)
  }

  const increaseQuantity = (itemId: string) => {
    const item = snapshot.value.items.find(entry => entry.id === itemId)
    if (item) {
      item.quantity += 1
      resetStatus()
    }
  }

  const decreaseQuantity = (itemId: string) => {
    const item = snapshot.value.items.find(entry => entry.id === itemId)
    if (item && item.quantity > 1) {
      item.quantity -= 1
      resetStatus()
    }
  }

  const removeItem = (itemId: string) => {
    snapshot.value.items = snapshot.value.items.filter(entry => entry.id !== itemId)
    resetStatus()
  }

  const resetStatus = () => {
    if (status.value !== "loading") {
      status.value = "idle"
    }
  }

  const checkoutStepCount = 3
  const readyStepCount = computed(() =>
    [
      shippingValidation.value.valid,
      snapshot.value.items.length > 0,
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

  const submit = async () => {
    if (snapshot.value.items.length === 0) {
      return
    }

    if (!shippingValidation.value.valid) {
      status.value = "error"
      toast.add({
        title: t("checkout.summary.addressRequiredTitle"),
        description: t("checkout.summary.addressRequiredDescription"),
        color: "warning",
      })
      return
    }

    if (walletShortage.value > 0) {
      const shortageAmount = walletShortage.value
      snapshot.value.walletBalance += shortageAmount
      
      toast.add({
        title: t("checkout.summary.topUpSuccessTitle"),
        description: t("checkout.summary.topUpSuccessDescription", {
          amount: `VND${shortageAmount.toLocaleString("en-US")}`,
        }),
        color: "success",
      })
      resetStatus()
      return
    }

    status.value = "loading"
    await new Promise(resolve => setTimeout(resolve, 700))
    status.value = "success"

    toast.add({
      title: t("checkout.summary.purchaseSuccessTitle"),
      description: t("checkout.summary.purchaseSuccessDescription"),
      color: "success",
    })
  }

  return {
    snapshot,
    status,
    subtotal,
    total,
    walletShortage,
    shippingValidation,
    progressValue,
    progressText,
    updateShippingAddress,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    submit,
  }
}
