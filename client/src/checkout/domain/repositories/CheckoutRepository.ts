import type { CheckoutSnapshot, ShippingAddress } from "../types/checkout.types"

export interface CheckoutRepository {
  getSnapshot(): Promise<CheckoutSnapshot>
  saveShippingAddress(address: ShippingAddress): Promise<ShippingAddress>
  submitOrder(snapshot: CheckoutSnapshot): Promise<{ success: boolean; orderId: string }>
}
