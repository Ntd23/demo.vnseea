export interface CheckoutLineItem {
  id: string
  name: string
  price: number
  quantity: number
  imageStyle?: string
}

export interface ShippingAddressForm {
  fullName: string
  phone: string
  country: string
  city: string
  postalCode: string
  streetAddress: string
}

export interface SavedShippingAddress extends ShippingAddressForm {}
