// English description: Bridges PHP referral rewards data into the Nuxt settings API.

import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"

type BackendReferral = {
  id?: string | number
  user_id?: string | number
  name?: string
  username?: string
  avatar?: string
  joined?: string
  registered?: string
  verified?: boolean | string | number
  profile_complete?: boolean | string | number
  reward_eligible?: boolean | string | number
  reward_paid?: boolean | string | number
  reward_amount?: string | number
  progress_percent?: string | number
  status?: string
}

type BackendAffiliatesResponse = {
  api_status?: string | number
  referral_link?: string
  reward_amount?: string | number
  currency?: string
  currency_symbol?: string
  required_qualified_referrals?: string | number
  qualified_referrals?: string | number
  progress_percent?: string | number
  profile_complete?: boolean | string | number
  verified?: boolean | string | number
  eligible_for_payout?: boolean | string | number
  referrals?: BackendReferral[]
}

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : fallback

const asNumber = (value: unknown, fallback = 0) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : fallback
}

const asBoolean = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true" || value === "on" || value === "active"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const hasText = (value: unknown) => asString(value).length > 0

const isProfileComplete = (user: Record<string, unknown>) =>
  hasText(user.first_name)
  && hasText(user.last_name)
  && hasText(user.email)
  && (hasText(user.phone_number) || hasText(user.phone))
  && hasText(user.address)

const fallbackReferralLink = (event: Parameters<typeof useRuntimeConfig>[0], username: string) => {
  const runtimeConfig = useRuntimeConfig(event)
  const baseUrl = asString(runtimeConfig.public.siteUrl || runtimeConfig.public.backendWebBase || "")
    .replace(/\/+$/, "")

  return `${baseUrl || ""}/register?ref=${encodeURIComponent(username)}`
}

export default defineEventHandler(async (event) => {
  const fallbackUser = await getBackendCurrentUser(event)

  let response: BackendAffiliatesResponse | null = null
  try {
    response = await createBackendApiClient(event).get<BackendAffiliatesResponse>("settings-affiliates")
  }
  catch {
    response = null
  }

  const rewardAmount = asNumber(response?.reward_amount)
  const requiredQualifiedReferrals = Math.max(1, asNumber(response?.required_qualified_referrals, 1))
  const profileComplete = response ? asBoolean(response.profile_complete) : isProfileComplete(fallbackUser)
  const verified = response ? asBoolean(response.verified) : asBoolean(fallbackUser.verified)
  const referrals = Array.isArray(response?.referrals)
    ? response.referrals.map((referral, index) => {
        const referralVerified = asBoolean(referral.verified)
        const referralProfileComplete = asBoolean(referral.profile_complete)
        const rewardEligible = asBoolean(referral.reward_eligible) || (referralVerified && referralProfileComplete)
        const rewardPaid = asBoolean(referral.reward_paid) || asString(referral.status) === "paid"
        const progressPercent = referral.progress_percent === undefined
          ? (referralProfileComplete ? 50 : 0) + (referralVerified ? 50 : 0)
          : clamp(asNumber(referral.progress_percent), 0, 100)

        return {
          id: referral.id ?? referral.user_id ?? index,
          name: asString(referral.name, asString(referral.username, "User")),
          username: asString(referral.username) || undefined,
          avatar: asString(referral.avatar) || undefined,
          joined: asString(referral.joined || referral.registered) || undefined,
          verified: referralVerified,
          profileComplete: referralProfileComplete,
          rewardEligible,
          rewardAmount: asNumber(referral.reward_amount, rewardAmount),
          progressPercent,
          status: rewardPaid ? "paid" : rewardEligible ? "qualified" : "pending",
        }
      })
    : []
  const qualifiedReferrals = response
    ? asNumber(response.qualified_referrals, referrals.filter(referral => referral.rewardEligible).length)
    : referrals.filter(referral => referral.rewardEligible).length
  const progressPercent = response
    ? clamp(asNumber(response.progress_percent), 0, 100)
    : clamp(Math.round((qualifiedReferrals / requiredQualifiedReferrals) * 100), 0, 100)

  return {
    referralLink: asString(response?.referral_link)
      || fallbackReferralLink(event, asString(fallbackUser.username)),
    rewardAmount,
    currency: asString(response?.currency, "USD"),
    currencySymbol: asString(response?.currency_symbol, "$"),
    requiredQualifiedReferrals,
    qualifiedReferrals,
    progressPercent,
    profileComplete,
    verified,
    eligibleForPayout: response
      ? asBoolean(response.eligible_for_payout)
      : profileComplete && verified && qualifiedReferrals >= requiredQualifiedReferrals,
    referrals,
    requirements: [
      { key: "profileComplete", label: "", complete: profileComplete },
      { key: "verified", label: "", complete: verified },
      { key: "qualifiedReferrals", label: "", complete: qualifiedReferrals >= requiredQualifiedReferrals },
    ],
  }
})
