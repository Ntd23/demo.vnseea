export interface CheckoutLineItem {
  id: string
  name: string
  price: number
  quantity: number
  imageStyle?: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  country: string
  city: string
  postalCode: string
  streetAddress: string
}

export interface CheckoutSnapshot {
  items: CheckoutLineItem[]
  shippingAddress: ShippingAddress | null
  walletBalance: number
  shippingFee: number
}
