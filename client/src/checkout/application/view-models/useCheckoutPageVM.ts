// English description: Checkout page view model that coordinates cart, address, wallet balance, and submit actions.

import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"
import type { SavedShippingAddress } from "../../domain/types/checkout.types"
import { createCheckoutSnapshot } from "../use-cases/create-checkout-snapshot"
import { createApiCheckoutRepository } from "../../infrastructure/repositories/ApiCheckoutRepository"

const cloneSnapshot = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export function useCheckoutPageVM(
  repository = createApiCheckoutRepository(),
) {
  const { t, locale } = useI18n()
  const toast = useToast()

  const { data: initialSnapshot } = useAsyncData(
    "checkout:snapshot",
    () => repository.getSnapshot(),
    {
      default: () => createCheckoutSnapshot(),
    },
  )

  const snapshot = ref(cloneSnapshot(createCheckoutSnapshot()))
  const checkoutState = ref<"idle" | "loading" | "success" | "error">("idle")

  watch(
    () => initialSnapshot.value,
    (value) => {
      snapshot.value = cloneSnapshot(value ?? createCheckoutSnapshot())
    },
    { immediate: true },
  )

  const cartItems = computed(() => snapshot.value.items)
  const savedAddress = computed<SavedShippingAddress | null>(() =>
    snapshot.value.shippingAddress ? { ...snapshot.value.shippingAddress } : null,
  )
  const walletBalance = computed(() => snapshot.value.walletBalance)
  const shippingFee = computed(() => snapshot.value.shippingFee)

  const subtotal = computed(() =>
    snapshot.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const total = computed(() => subtotal.value + snapshot.value.shippingFee)
  const walletShortage = computed(() => Math.max(total.value - snapshot.value.walletBalance, 0))
  const hasSavedAddress = computed(() => Boolean(snapshot.value.shippingAddress))

  const checkoutStepCount = 3
  const readyStepCount = computed(() =>
    [
      hasSavedAddress.value,
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

  async function handleAddressSubmit(address: SavedShippingAddress) {
    const saved = await repository.saveShippingAddress(address)
    snapshot.value.shippingAddress = { ...saved }
    resetCheckoutState()
  }

  function increaseQuantity(itemId: string) {
    const item = snapshot.value.items.find(entry => entry.id === itemId)

    if (!item) {
      return
    }

    item.quantity += 1
    resetCheckoutState()
  }

  function decreaseQuantity(itemId: string) {
    const item = snapshot.value.items.find(entry => entry.id === itemId)

    if (!item || item.quantity <= 1) {
      return
    }

    item.quantity -= 1
    resetCheckoutState()
  }

  function removeItem(itemId: string) {
    snapshot.value.items = snapshot.value.items.filter(entry => entry.id !== itemId)
    resetCheckoutState()
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

    if (walletShortage.value > 0) {
      toast.add({
        title: t("checkout.summary.walletShortageTitle"),
        description: t("checkout.summary.walletShortageDescription", {
          amount: formatVnd(walletShortage.value),
        }),
        color: "warning",
      })

      checkoutState.value = "error"
      return
    }

    checkoutState.value = "loading"

    try {
      await repository.submitOrder(cloneSnapshot(snapshot.value))
      checkoutState.value = "success"

      toast.add({
        title: t("checkout.summary.purchaseSuccessTitle"),
        description: t("checkout.summary.purchaseSuccessDescription"),
        color: "success",
      })
    }
    catch {
      checkoutState.value = "error"
    }
  }

  function resetCheckoutState() {
    if (checkoutState.value !== "loading") {
      checkoutState.value = "idle"
    }
  }

  function formatVnd(value: number) {
    return formatCurrency(value, {
      currency: "VND",
      locale: locale.value,
    })
  }

  function selectAddress(address: SavedShippingAddress) {
    snapshot.value.shippingAddress = { ...address }
  }

  async function fetchSavedAddresses() {
    return await repository.getAddresses()
  }

  return {
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
  }
}
