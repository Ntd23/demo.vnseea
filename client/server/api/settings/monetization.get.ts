// English description: Bridges PHP monetization settings data into the Nuxt settings API.

import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"

type BackendMonetizationPlan = {
  id?: string | number
  title?: string
  description?: string
  price?: string | number
  currency?: string
  status?: string
}

type BackendMonetizationResponse = {
  api_status?: string | number
  enabled?: boolean | string | number
  eligible?: boolean | string | number
  wallet_balance?: string | number
  currency?: string
  currency_symbol?: string
  profile_complete?: boolean | string | number
  verified?: boolean | string | number
  plans?: BackendMonetizationPlan[]
}

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : fallback

const asNumber = (value: unknown, fallback = 0) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : fallback
}

const asBoolean = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true" || value === "on" || value === "active"

const hasText = (value: unknown) => asString(value).length > 0

const isProfileComplete = (user: Record<string, unknown>) =>
  hasText(user.first_name)
  && hasText(user.last_name)
  && hasText(user.email)
  && (hasText(user.phone_number) || hasText(user.phone))
  && hasText(user.address)

export default defineEventHandler(async (event) => {
  const fallbackUser = await getBackendCurrentUser(event)

  let response: BackendMonetizationResponse | null = null
  try {
    response = await createBackendApiClient(event).get<BackendMonetizationResponse>("settings-monetization")
  }
  catch {
    response = null
  }

  const profileComplete = response ? asBoolean(response.profile_complete) : isProfileComplete(fallbackUser)
  const verified = response ? asBoolean(response.verified) : asBoolean(fallbackUser.verified)
  const currency = asString(response?.currency, "USD")
  const currencySymbol = asString(response?.currency_symbol, "$")

  return {
    enabled: response ? asBoolean(response.enabled) : asBoolean(fallbackUser.have_monetization),
    eligible: response ? asBoolean(response.eligible) : profileComplete && verified,
    walletBalance: asNumber(response?.wallet_balance ?? fallbackUser.wallet),
    currency,
    currencySymbol,
    requirements: [
      { key: "profileComplete", label: "", complete: profileComplete },
      { key: "verified", label: "", complete: verified },
    ],
    plans: Array.isArray(response?.plans)
      ? response.plans.map((plan, index) => ({
          id: plan.id ?? index,
          title: asString(plan.title, "Plan"),
          description: asString(plan.description),
          price: asNumber(plan.price),
          currency: asString(plan.currency, currency),
          status: asBoolean(plan.status) || plan.status === "active" ? "active" : "inactive",
        }))
      : [],
  }
})
