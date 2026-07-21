// English description: Resolves the checkout display currency from the currencies carried by cart items.

import type { CheckoutCurrencyRule, CheckoutLineItem } from "../../domain/types/checkout.types"

export interface CheckoutCurrencyContext {
  currency: string
  currencySymbol?: string
  currencyRule?: CheckoutCurrencyRule
}

export function resolveCheckoutCurrency(
  items: CheckoutLineItem[],
  fallback: CheckoutCurrencyContext,
): CheckoutCurrencyContext {
  const currencies = Array.from(new Set(
    items
      .map(item => item.currency?.trim().toUpperCase())
      .filter((currency): currency is string => Boolean(currency)),
  ))

  if (currencies.length !== 1) {
    return fallback
  }

  const currency = currencies[0]

  if (!currency) {
    return fallback
  }

  const representativeItem = items.find(item => item.currency?.trim().toUpperCase() === currency)

  return {
    currency,
    currencySymbol: representativeItem?.currencySymbol || fallback.currencySymbol,
    currencyRule: representativeItem?.currencyRule || fallback.currencyRule,
  }
}
