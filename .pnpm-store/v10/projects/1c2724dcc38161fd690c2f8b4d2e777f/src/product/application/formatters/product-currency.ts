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
  if (product.priceFormat) {
    const symbol = product.currencySymbol?.trim()

    return symbol ? `${symbol}${product.priceFormat}` : product.priceFormat
  }

  return formatCurrency(product.price, {
    currency: product.currency || "VND",
    currencySymbol: product.currencySymbol,
    currencyRule: product.currencyRule,
    locale,
  })
}
