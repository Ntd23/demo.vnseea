import { computed } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

export type BillingCycle = "monthly" | "yearly"
export type ProPlanKey = "starter" | "creator" | "business"

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

export type PaymentMethodKey = "wallet" | "card" | "bank"

export type ProCheckoutPayload = {
  planId: ProPlanKey
  billingCycle: BillingCycle
  paymentMethod: PaymentMethodKey
  amount: number
}

export const useMockGoProData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const plans = computed(() => localized<ProPlan[]>("pages.goProPage.plans"))

  const comparisonRows = computed(() =>
    localized<Array<{ label: string; starter: boolean; creator: boolean; business: boolean }>>("pages.goProPage.comparisonRows"),
  )

  const paymentMethods = computed(() =>
    localized<Array<{ label: string; value: PaymentMethodKey; icon: string }>>("pages.goProPage.paymentMethods"),
  )

  const currentSubscription = computed(() =>
    localized<{ plan: string; status: string; renewsAt: string }>("pages.goProPage.currentSubscription"),
  )

  return {
    plans,
    comparisonRows,
    paymentMethods,
    currentSubscription,
  }
}

export const formatProCurrency = (value: number, locale = "vi") =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
