// English description: Product currency presentation formatter shared by product view models.

import { formatCurrency } from "#shared-kernel/application/utils/formatCurrency"

type ProductCurrencyRule = {
  decimals?: number | string
  decimal_sep?: string
  thousand_sep?: string
}

export type ProductPriceLike = {
  price: number
  currency?: string
  currencySymbol?: string
  currencyRule?: ProductCurrencyRule
  priceFormat?: string
}

export const formatProductPrice = (
  product: ProductPriceLike,
  locale: string,
) => {
  const currencyCode = product.currency?.trim().toUpperCase() || "VND"
  const currencySymbol = product.currencySymbol?.trim()
  const currencyUnit = currencyCode === "VND"
    ? "VND"
    : currencySymbol || currencyCode
  const formattedAmount = product.priceFormat || formatCurrency(product.price, {
    currencyRule: product.currencyRule,
    locale,
  })

  return `${formattedAmount}${currencyUnit}`
}
