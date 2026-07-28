// English description: Checkout API bridge helpers that normalize PHP market and address responses.

import { createError, getCookie, type H3Event } from "h3"
import { getBackendBaseCandidates } from "../../utils/backend-api-client"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import type { CheckoutLineItem, CheckoutSnapshot, ShippingAddress } from "../../../src/checkout/domain/types/checkout.types"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendMarketCheckoutResponse = {
  api_status?: number | string
  data?: BackendProduct[]
  total?: number | string
  total_points?: number | string
  currency_code?: string
  currency_symbol?: string
  currency_rule?: CheckoutSnapshot["currencyRule"]
}

type BackendAddressResponse = {
  api_status?: number | string
  data?: BackendAddress[]
}

type BackendCurrentUserResponse = {
  api_status?: number | string
  user_data?: {
    wallet?: number | string
    points?: number | string
  }
}

type BackendAddress = {
  id?: number | string
  name?: string
  phone?: string
  country?: string
  city?: string
  zip?: string
  address?: string
}

type BackendProduct = {
  id?: number | string
  name?: string
  price?: number | string
  point?: number | string
  units?: number | string
  stock_units?: number | string
  currency?: string | number
  currency_code?: string
  currency_symbol?: string
  currency_rule?: CheckoutLineItem["currencyRule"]
  checkout_price?: number | string
  checkout_point?: number | string
  images?: Array<string | { image?: string; image_org?: string }>
}

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  return fallback
}

const asPlainAddressText = (value: unknown) => asString(value)
  .replace(/<br\s*\/?>/gi, ", ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/\s+/g, " ")
  .replace(/\s+,/g, ",")
  .trim()

const getProductImage = (product: BackendProduct, resolveMediaUrl: ReturnType<typeof createBackendMediaUrlResolver>) => {
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  const image = typeof firstImage === "string"
    ? firstImage
    : firstImage?.image_org || firstImage?.image

  return resolveMediaUrl(image) || undefined
}

const normalizeCurrency = (value: unknown) => {
  const currency = asString(value).toUpperCase()
  return /^[A-Z]{3}$/.test(currency) ? currency : ""
}

export const normalizeAddress = (address: BackendAddress | null | undefined): ShippingAddress | null => {
  if (!address) {
    return null
  }

  return {
    id: asString(address.id) || undefined,
    fullName: asString(address.name),
    phone: asString(address.phone),
    country: asString(address.country),
    city: asString(address.city),
    streetAddress: asPlainAddressText(address.address),
  }
}

export const normalizeCheckoutSnapshot = (
  event: H3Event,
  checkout: BackendMarketCheckoutResponse,
  addresses: BackendAddressResponse,
  balances: { walletBalance: number; pointsBalance: number },
): CheckoutSnapshot => {
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const products = Array.isArray(checkout.data) ? checkout.data : []

  const items: CheckoutLineItem[] = products.map(product => ({
    id: asString(product.id),
    name: asString(product.name),
    price: asNumber(product.price),
    point: Math.max(0, asNumber(product.point)),
    quantity: Math.max(1, asNumber(product.units, 1)),
    maxQuantity: Math.max(0, asNumber(product.stock_units)),
    imageUrl: getProductImage(product, resolveMediaUrl),
    currency: normalizeCurrency(product.currency_code || product.currency),
    currencySymbol: asString(product.currency_symbol),
    currencyRule: product.currency_rule,
    checkoutPrice: asNumber(product.checkout_price, asNumber(product.price)),
    checkoutPoint: Math.max(0, asNumber(product.checkout_point, asNumber(product.point))),
  })).filter(item => item.id && item.name)

  const productCurrencies = Array.from(new Set(
    items
      .map(item => item.currency)
      .filter((currency): currency is string => Boolean(currency)),
  ))
  const singleProductCurrency = productCurrencies.length === 1
    ? productCurrencies[0]
    : null
  const firstItem = items[0]

  if (singleProductCurrency) {
    for (const item of items) {
      item.checkoutPrice = item.price
    }
  }

  return {
    items,
    shippingAddress: normalizeAddress(Array.isArray(addresses.data) ? addresses.data[0] : null),
    walletBalance: balances.walletBalance,
    pointsBalance: balances.pointsBalance,
    shippingFee: 0,
    currency: singleProductCurrency || normalizeCurrency(checkout.currency_code),
    currencySymbol: singleProductCurrency
      ? firstItem?.currencySymbol
      : asString(checkout.currency_symbol),
    currencyRule: singleProductCurrency
      ? firstItem?.currencyRule
      : checkout.currency_rule,
  }
}

export const getBackendCheckoutBalances = async (event: H3Event) => {
  const backendUserSession = getCookie(event, "user_id")

  if (!backendUserSession) {
    return { walletBalance: 0, pointsBalance: 0 }
  }

  const runtimeConfig = useRuntimeConfig(event)
  const baseCandidates = getBackendBaseCandidates(
    String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase),
  )

  for (const baseURL of baseCandidates) {
    try {
      const response = await $fetch<BackendCurrentUserResponse>(backendRoutes.session.currentUser(backendUserSession), {
        baseURL,
      })
      return {
        walletBalance: asNumber(response.user_data?.wallet),
        pointsBalance: Math.max(0, asNumber(response.user_data?.points)),
      }
    }
    catch {
      // Try the next configured backend base.
    }
  }

  return { walletBalance: 0, pointsBalance: 0 }
}

export const assertBackendOk = (response: { api_status?: number | string; message?: string; errors?: { error_text?: string } }) => {
  const status = Number(response.api_status ?? 0)

  if (status < 200 || status >= 300) {
    throw createError({
      statusCode: 400,
      statusMessage: response.errors?.error_text || response.message || "Backend rejected checkout request.",
    })
  }
}
