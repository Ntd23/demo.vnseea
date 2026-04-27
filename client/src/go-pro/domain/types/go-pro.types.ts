export type BillingCycle = "monthly" | "yearly"
export type ProPlanKey = "starter" | "creator" | "business"
export type PaymentMethodKey = "wallet" | "card" | "bank"

export type ProPlan = {
  id: ProPlanKey
  name: string
  badge: string
  monthlyPrice: number
  yearlyPrice: number
  description: string
  highlight: boolean
  features: string[]
  limits: { label: string; value: string }[]
}

export type ProComparisonRow = {
  label: string
} & Record<ProPlanKey, boolean>

export type ProPaymentMethod = {
  label: string
  value: PaymentMethodKey
  icon: string
}

export type ProSubscriptionSummary = {
  plan: string
  status: string
  renewsAt: string
}

export type ProCheckoutPayload = {
  planId: ProPlanKey
  billingCycle: BillingCycle
  paymentMethod: PaymentMethodKey
  amount: number
}
