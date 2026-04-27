import { useOrderPresentation as useDDDOrderPresentation } from "../../src/orders/application/composables/useOrderPresentation"
export { 
  orderItemFallbackBackground,
  getOrderSubtotal,
  getOrderTotalItems,
  getActiveOrderProgressStep,
  getRepeatOrderActionLabel 
} from "../../src/orders/application/composables/useOrderPresentation"

/**
 * Legacy delegate for useOrderPresentation.
 * Logic has been moved to src/orders/application/composables/useOrderPresentation.ts
 */
export const useOrderPresentation = useDDDOrderPresentation
