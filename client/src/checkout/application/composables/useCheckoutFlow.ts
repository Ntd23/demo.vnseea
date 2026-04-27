import { computed, ref } from "vue"
import { validateShippingAddress } from "../../domain/specifications/shipping-address.specification"
import type { CheckoutSnapshot, ShippingAddress } from "../../domain/types/checkout.types"
import { saveShippingAddress as persistShippingAddress } from "../../infrastructure/persistence/checkout.storage"

export const useCheckoutFlow = (
  storageKey: string,
  initialSnapshot: CheckoutSnapshot,
) => {
  const snapshot = ref<CheckoutSnapshot>(JSON.parse(JSON.stringify(initialSnapshot)) as CheckoutSnapshot)
  const status = ref<"idle" | "loading" | "success" | "error">("idle")

  const subtotal = computed(() =>
    snapshot.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const total = computed(() => subtotal.value + snapshot.value.shippingFee)

  const shippingValidation = computed(() =>
    snapshot.value.shippingAddress
      ? validateShippingAddress(snapshot.value.shippingAddress)
      : { valid: false, errors: ["Shipping address is required"] },
  )

  const updateShippingAddress = (address: ShippingAddress) => {
    snapshot.value.shippingAddress = { ...address }
    status.value = "idle"
    persistShippingAddress(storageKey, address)
  }

  const submit = async () => {
    if (!shippingValidation.value.valid || snapshot.value.items.length === 0) {
      status.value = "error"
      return
    }

    status.value = "loading"
    await new Promise(resolve => setTimeout(resolve, 200))
    status.value = "success"
  }

  return {
    snapshot,
    status,
    subtotal,
    total,
    shippingValidation,
    updateShippingAddress,
    submit,
  }
}
