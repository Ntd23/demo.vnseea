// English description: Checkout domain types shared by checkout view models, repositories, and API bridges.

export interface CheckoutLineItem {
  id: string
  name: string
  price: number
  point: number
  quantity: number
  maxQuantity?: number
  imageStyle?: string
  imageUrl?: string
  currency?: string
  currencySymbol?: string
  currencyRule?: CheckoutCurrencyRule
  checkoutPrice?: number
  checkoutPoint?: number
}

export interface CheckoutCurrencyRule {
  decimals?: number | string
  decimal_sep?: string
  thousand_sep?: string
}

export interface ShippingAddress {
  id?: string
  fullName: string
  phone: string
  country: string
  city: string
  streetAddress: string
}

export interface ShippingAddressForm extends ShippingAddress {}

export interface SavedShippingAddress extends ShippingAddress {}

export interface CheckoutSnapshot {
  items: CheckoutLineItem[]
  shippingAddress: ShippingAddress | null
  walletBalance: number
  pointsBalance: number
  shippingFee: number
  currency: string
  currencySymbol?: string
  currencyRule?: CheckoutCurrencyRule
}
