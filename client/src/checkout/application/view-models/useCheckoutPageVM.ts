// English description: Checkout page view model that coordinates cart, address, quantity, and submit actions.

import type { SavedShippingAddress } from "../../domain/types/checkout.types"
import { createCheckoutSnapshot } from "../use-cases/create-checkout-snapshot"
import { resolveCheckoutCurrency } from "../utils/resolve-checkout-currency"
import { createApiCheckoutRepository } from "../../infrastructure/repositories/ApiCheckoutRepository"

const cloneSnapshot = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export function useCheckoutPageVM(
  repository = createApiCheckoutRepository(),
) {
  const { t } = useI18n()
  const toast = useToast()

  const { data: initialSnapshot, pending: isLoading } = useAsyncData(
    "checkout:snapshot",
    () => repository.getSnapshot(),
    {
      default: () => createCheckoutSnapshot(),
      server: false,
    },
  )

  const snapshot = ref(cloneSnapshot(createCheckoutSnapshot()))
  const savedAddresses = ref<SavedShippingAddress[]>([])
  const isLoadingAddresses = ref(true)
  const isDeletingAddress = ref(false)
  const checkoutState = ref<"idle" | "loading" | "success" | "error">("idle")

  watch(
    () => initialSnapshot.value,
    (value) => {
      snapshot.value = cloneSnapshot(value ?? createCheckoutSnapshot())

      // Restore active address from localStorage if available on the client side
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem("checkout:active-address")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed && typeof parsed === "object") {
              snapshot.value.shippingAddress = parsed
            }
          } catch {
            // noop
          }
        }
      }
    },
    { immediate: true },
  )

  const cartItems = computed(() => snapshot.value.items)
  const savedAddress = computed<SavedShippingAddress | null>(() =>
    snapshot.value.shippingAddress ? { ...snapshot.value.shippingAddress } : null,
  )
  const shippingFee = computed(() => snapshot.value.shippingFee)
  const checkoutCurrencyContext = computed(() => resolveCheckoutCurrency(
    snapshot.value.items,
    {
      currency: snapshot.value.currency,
      currencySymbol: snapshot.value.currencySymbol,
      currencyRule: snapshot.value.currencyRule,
    },
  ))
  const checkoutCurrency = computed(() => checkoutCurrencyContext.value.currency)
  const checkoutCurrencySymbol = computed(() => checkoutCurrencyContext.value.currencySymbol)
  const checkoutCurrencyRule = computed(() => checkoutCurrencyContext.value.currencyRule)

  function selectAddress(address: SavedShippingAddress) {
    snapshot.value.shippingAddress = { ...address }

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("checkout:active-address", JSON.stringify(address))
    }

    resetCheckoutState()
  }

  async function loadSavedAddresses() {
    isLoadingAddresses.value = true

    try {
      const addresses = await repository.getAddresses()
      savedAddresses.value = addresses
        .filter((address): address is SavedShippingAddress => Boolean(address?.id))
        .map(address => ({ ...address }))

      const activeId = snapshot.value.shippingAddress?.id
      const activeAddress = savedAddresses.value.find(address => address.id === activeId)

      if (activeAddress) {
        selectAddress(activeAddress)
      }
      else if (savedAddresses.value[0]) {
        selectAddress(savedAddresses.value[0])
      }
    }
    finally {
      isLoadingAddresses.value = false
    }
  }

  onMounted(() => {
    void loadSavedAddresses()
  })

  async function handleAddressSubmit(address: SavedShippingAddress) {
    const saved = await repository.saveShippingAddress(address)

    if (!saved.id) {
      throw new Error("The backend did not return a saved address ID.")
    }

    const savedIndex = savedAddresses.value.findIndex(entry => entry.id === saved.id)

    if (savedIndex >= 0) {
      savedAddresses.value.splice(savedIndex, 1, { ...saved })
    }
    else {
      savedAddresses.value.unshift({ ...saved })
    }

    selectAddress(saved)
    return saved
  }

  async function deleteSavedAddress(addressId: string) {
    isDeletingAddress.value = true

    try {
      await repository.deleteAddress(addressId)
      savedAddresses.value = savedAddresses.value.filter(address => address.id !== addressId)

      if (snapshot.value.shippingAddress?.id === addressId) {
        const nextAddress = savedAddresses.value[0]

        if (nextAddress) {
          selectAddress(nextAddress)
        }
        else {
          snapshot.value.shippingAddress = null
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.removeItem("checkout:active-address")
          }
          resetCheckoutState()
        }
      }

      toast.add({
        title: t("checkout.shippingForm.deleteSuccessTitle"),
        description: t("checkout.shippingForm.deleteSuccessDescription"),
        color: "success",
      })
    }
    catch {
      toast.add({
        title: t("checkout.shippingForm.deleteErrorTitle"),
        description: t("checkout.shippingForm.deleteErrorDescription"),
        color: "error",
      })
      throw new Error("Unable to delete the selected shipping address.")
    }
    finally {
      isDeletingAddress.value = false
    }
  }

  async function increaseQuantity(itemId: string) {
    const item = snapshot.value.items.find(entry => entry.id === itemId)

    if (
      !item
      || (
        item.maxQuantity !== undefined
        && item.maxQuantity > 0
        && item.quantity >= item.maxQuantity
      )
    ) {
      return
    }

    // Optimistic UI update
    item.quantity += 1
    resetCheckoutState()

    try {
      await repository.updateCartItemQuantity(itemId, item.quantity)
    } catch (err) {
      // Revert if error occurs
      item.quantity -= 1
      resetCheckoutState()
      toast.add({
        title: t("checkout.summary.purchaseErrorTitle"),
        description: t("checkout.summary.purchaseErrorDescription"),
        color: "error",
      })
    }
  }

  async function decreaseQuantity(itemId: string) {
    const item = snapshot.value.items.find(entry => entry.id === itemId)

    if (!item) {
      return
    }

    const originalQty = item.quantity

    if (item.quantity <= 1) {
      return
    }

    // Optimistic UI update
    item.quantity -= 1
    resetCheckoutState()

    try {
      await repository.updateCartItemQuantity(itemId, item.quantity)
    } catch (err) {
      // Revert if error occurs
      item.quantity = originalQty
      resetCheckoutState()
      toast.add({
        title: t("checkout.summary.purchaseErrorTitle"),
        description: t("checkout.summary.purchaseErrorDescription"),
        color: "error",
      })
    }
  }

  async function removeItem(itemId: string) {
    const originalItems = cloneSnapshot(snapshot.value.items)

    // Optimistic UI update
    snapshot.value.items = snapshot.value.items.filter(entry => entry.id !== itemId)
    resetCheckoutState()

    try {
      await repository.removeCartItem(itemId)
    } catch (err) {
      // Revert if error occurs
      snapshot.value.items = originalItems
      resetCheckoutState()
      toast.add({
        title: t("checkout.summary.purchaseErrorTitle"),
        description: t("checkout.summary.purchaseErrorDescription"),
        color: "error",
      })
    }
  }

  async function handleCheckoutAction() {
    if (!snapshot.value.items.length) {
      return
    }

    if (!snapshot.value.shippingAddress) {
      checkoutState.value = "error"

      toast.add({
        title: t("checkout.summary.addressRequiredTitle"),
        description: t("checkout.summary.addressRequiredDescription"),
        color: "warning",
      })

      return
    }

    checkoutState.value = "loading"

    try {
      await repository.submitOrder(cloneSnapshot(snapshot.value))
      checkoutState.value = "success"

      // Trigger Confetti Celebration (client-only dynamic import)
      if (typeof window !== "undefined") {
        try {
          const confettiModule = await import("@hiseb/confetti")
          const confetti = confettiModule.default
          
          // Fire a beautiful sequence of 3 confetti bursts
          const positionList = [
            { x: window.innerWidth * 0.50, y: window.innerHeight * 0.60 },
            { x: window.innerWidth * 0.25, y: window.innerHeight * 0.40 },
            { x: window.innerWidth * 0.75, y: window.innerHeight * 0.30 },
          ]
          for (let i = 0; i < positionList.length; i++) {
            setTimeout(() => confetti({ position: positionList[i] }), i * 250)
          }
        } catch (e) {
          // ignore confetti errors
        }

        // Wait 3.5 seconds for confetti animation, then navigate to purchased page
        setTimeout(async () => {
          await navigateTo("/purchased")
        }, 3500)
      }
    }
    catch {
      checkoutState.value = "error"
      toast.add({
        title: t("checkout.summary.purchaseErrorTitle"),
        description: t("checkout.summary.purchaseErrorDescription"),
        color: "error",
      })
    }
  }

  function resetCheckoutState() {
    if (checkoutState.value !== "loading") {
      checkoutState.value = "idle"
    }
  }

  return {
    isLoading,
    isLoadingAddresses,
    isDeletingAddress,
    cartItems,
    savedAddress,
    savedAddresses,
    shippingFee,
    checkoutCurrency,
    checkoutCurrencySymbol,
    checkoutCurrencyRule,
    checkoutState,
    handleAddressSubmit,
    deleteSavedAddress,
    selectAddress,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    handleCheckoutAction,
  }
}
