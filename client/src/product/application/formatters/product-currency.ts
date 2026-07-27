// English description: Formats product prices with one consistent Vietnamese thousands separator.

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
  _locale: string,
) => {
  const currencyCode = product.currency?.trim().toUpperCase() || "VND"
  const currencySymbol = product.currencySymbol?.trim()
  const currencyUnit = currencyCode === "VND" ? "VND" : currencySymbol || currencyCode
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(Math.round(Number.isFinite(product.price) ? product.price : 0))

  return currencyUnit ? `${formattedAmount} ${currencyUnit}` : formattedAmount
}
