// English description: Provides safe display helpers for order text that may be raw backend data or i18n keys.
export function useOrderDisplayText() {
  const { t, te } = useI18n()

  const displayOrderText = (value?: string | null, fallback = "") => {
    const text = String(value ?? "").trim()

    if (!text) {
      return fallback
    }

    return te(text) ? t(text) : text
  }

  const displayOrderPaymentMethod = (value?: string | null, fallback = "") => {
    const text = String(value ?? "").trim()

    if (!text) {
      return fallback
    }

    if (te(text)) {
      return t(text)
    }

    const normalized = text.toLowerCase().replace(/[\s_-]+/g, "")
    const paymentKeyByAlias: Record<string, string> = {
      wallet: "orders.payment.wallet",
      vnseeawallet: "orders.payment.wallet",
      refunded: "orders.payment.refunded",
    }
    const aliasKey = paymentKeyByAlias[normalized]

    if (aliasKey && te(aliasKey)) {
      return t(aliasKey)
    }

    const directKey = `orders.payment.${text.toLowerCase().replace(/[\s_-]+/g, "_")}`

    return te(directKey) ? t(directKey) : text
  }

  return {
    displayOrderPaymentMethod,
    displayOrderText,
  }
}
