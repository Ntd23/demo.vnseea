// English description: Returns the current user's backend advertising campaigns for the Nuxt ads manager route.

import { getQuery } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { mapAdCampaign } from "./_shared"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import type { AdsManagerOverview } from "../../../src/ads/domain/types/ads.types"

type BackendEntity = Record<string, unknown>

type BackendAdsResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendWalletOverviewResponse = {
  api_status?: number | string
  balance?: number | string
  currency?: string
  currency_symbol?: string
  errors?: {
    error_text?: string
  }
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

const clampLimit = (value: unknown) => {
  const limit = asNumber(value)
  if (limit < 1) return 20
  return Math.min(limit, 50)
}

export default defineEventHandler(async (event): Promise<AdsManagerOverview> => {
  await getBackendCurrentUser(event)

  const query = getQuery(event)
  const limit = clampLimit(query.limit)
  const offset = asNumber(query.offset)
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)

  const [adsResponse, walletResponse] = await Promise.all([
    client.post<BackendAdsResponse>("ads", {
      type: "fetch_ads",
      limit,
      offset,
    }),
    client.get<BackendWalletOverviewResponse>("wallet-overview").catch(() => null),
  ])

  const ads = assertBackendApiSuccess(adsResponse, "Unable to load advertising campaigns.")
  const wallet = Number(walletResponse?.api_status ?? 0) >= 200 && Number(walletResponse?.api_status ?? 0) < 300
    ? walletResponse
    : null
  const campaigns = (ads.data ?? []).map(item => mapAdCampaign(item, resolveMediaUrl))
  const lastCampaign = campaigns[campaigns.length - 1]

  return {
    campaigns,
    balance: asNumber(wallet?.balance),
    currency: asString(wallet?.currency),
    currencySymbol: asString(wallet?.currency_symbol),
    hasMore: campaigns.length >= limit,
    nextOffset: lastCampaign?.id ?? null,
    canCreateAds: true,
  }
})
