// English description: Formats product prices with one consistent Vietnamese thousands separator.

type ProductCurrencyRule = {
  decimals?: number | string
  decimal_sep?: string
  thousand_sep?: string
}

export type ProductPriceLike = {
  price: number
  point?: number
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

export const formatProductPoints = (
  product: Pick<ProductPriceLike, "point">,
  locale: string,
) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
  Math.max(0, Math.trunc(Number(product.point) || 0)),
)} VNSEEA`

export const formatProductPriceSummary = (
  product: ProductPriceLike,
  locale: string,
) => Number(product.point) > 0
  ? `${formatProductPrice(product, locale)} · ${formatProductPoints(product, locale)}`
  : formatProductPrice(product, locale)
