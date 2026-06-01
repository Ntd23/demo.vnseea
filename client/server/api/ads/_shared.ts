// English description: Maps backend advertising API records and proxies campaign mutations for Nuxt ads routes.

import { createError, readMultipartFormData, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import type { AdsCampaign, AdsCampaignStats, AdsMutationResult, AdsOptionItem, AdsOptions, AdsPageOption } from "../../../src/ads/domain/types/ads.types"

type BackendEntity = Record<string, unknown>

type BackendAdsResponse = {
  api_status?: number | string
  data?: BackendEntity | BackendEntity[]
  message?: string
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

const asRecord = (value: unknown): BackendEntity =>
  value && typeof value === "object" && !Array.isArray(value) ? value as BackendEntity : {}

export const mapAdCampaign = (
  item: BackendEntity,
  resolveMediaUrl: (value: unknown) => string,
): AdsCampaign => {
  const id = asNumber(item.id)

  return {
    id,
    name: asString(item.name),
    websiteUrl: asString(item.url),
    headline: asString(item.headline),
    description: asString(item.description),
    mediaUrl: resolveMediaUrl(item.ad_media),
    bidding: asString(item.bidding),
    placement: asString(item.appears),
    location: asString(item.location),
    clicks: asNumber(item.clicks),
    views: asNumber(item.views),
    spent: asNumber(item.spent),
    budget: asNumber(item.budget),
    status: asString(item.status) === "1" ? "active" : "inactive",
    editUrl: appRoutes.adsEdit(id),
    chartUrl: appRoutes.adsChart(id),
    audienceIds: Array.isArray(item.country_ids) ? item.country_ids.map(asString).filter(Boolean) : asString(item.audience).split(",").filter(Boolean),
    gender: asString(item.gender) || "all",
    startDate: asString(item.start),
    endDate: asString(item.end),
    pageId: asNumber(item.page_id),
  }
}

const appendValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return
  formData.set(key, String(value))
}

export async function readAdsMultipartDraft(event: H3Event, type: "create" | "edit", adId?: number) {
  const parts = await readMultipartFormData(event)
  const formData = new FormData()

  formData.set("type", type)
  if (adId) formData.set("ad_id", String(adId))

  for (const part of parts ?? []) {
    if (!part.name) continue

    if (part.filename) {
      formData.set(part.name, new Blob([part.data], { type: part.type || "application/octet-stream" }), part.filename)
      continue
    }

    appendValue(formData, part.name, part.data.toString())
  }

  return formData
}

export async function fetchAdsCampaign(event: H3Event, id: number) {
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendAdsResponse>("ads", { type: "fetch_ad_by_id", ad_id: id }),
    "Unable to load advertising campaign.",
  )
  const campaign = mapAdCampaign(asRecord(response.data), resolveMediaUrl)

  if (!campaign.id) {
    throw createError({
      statusCode: 404,
      statusMessage: "Advertising campaign not found.",
    })
  }

  return campaign
}

export async function submitAdsCampaign(event: H3Event, formData: FormData): Promise<AdsMutationResult> {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendAdsResponse, FormData>("ads", formData),
    "Unable to save advertising campaign.",
  )
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const data = asRecord(response.data)

  return {
    success: true,
    message: asString(response.message) || "Advertising campaign saved.",
    campaign: data.id ? mapAdCampaign(data, resolveMediaUrl) : undefined,
  }
}

export async function fetchAdsOptions(event: H3Event): Promise<AdsOptions> {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendAdsResponse>("ads", { type: "fetch_options" }),
    "Unable to load advertising options.",
  )
  const data = asRecord(response.data)
  const mapOptions = (value: unknown): AdsOptionItem[] =>
    Object.entries(asRecord(value))
      .filter(([key]) => key !== "0")
      .map(([value, label]) => ({ value, label: asString(label) || value }))
  const pages = Array.isArray(data.pages)
    ? data.pages.map((page): AdsPageOption => {
        const item = asRecord(page)
        const slug = asString(item.page_name)

        return {
          id: asNumber(item.page_id),
          name: asString(item.page_title) || slug,
          slug,
          url: slug ? `/${slug}` : "",
        }
      }).filter(page => page.id && page.slug)
    : []
  const prices = asRecord(data.prices)

  return {
    audience: mapOptions(data.audience),
    genders: [{ value: "all", label: "Tất cả" }, ...mapOptions(data.genders)],
    placements: mapOptions(data.placements),
    pages,
    prices: {
      clicks: asNumber(prices.clicks),
      views: asNumber(prices.views),
      currency: asString(prices.currency),
      currencySymbol: asString(prices.currency_symbol),
    },
  }
}

export async function fetchAdsStats(event: H3Event, id: number): Promise<AdsCampaignStats> {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendAdsResponse>("ads", { type: "fetch_ad_stats", ad_id: id }),
    "Unable to load advertising statistics.",
  )
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const data = asRecord(response.data)
  const campaign = mapAdCampaign(asRecord(data.ad), resolveMediaUrl)
  const points = new Map<string, { date: string; clicks: number; views: number; spend: number }>()

  for (const item of Array.isArray(data.views) ? data.views : []) {
    const row = asRecord(item)
    const date = asString(row.DateOnly)
    if (!date) continue
    const current = points.get(date) ?? { date, clicks: 0, views: 0, spend: 0 }
    current.views += asNumber(row.ADviews)
    current.spend += asNumber(row.Spend)
    points.set(date, current)
  }

  for (const item of Array.isArray(data.clicks) ? data.clicks : []) {
    const row = asRecord(item)
    const date = asString(row.DateOnly)
    if (!date) continue
    const current = points.get(date) ?? { date, clicks: 0, views: 0, spend: 0 }
    current.clicks += asNumber(row.ADClicks)
    current.spend += asNumber(row.Spend)
    points.set(date, current)
  }

  return {
    campaign,
    points: [...points.values()].sort((a, b) => a.date.localeCompare(b.date)),
  }
}
