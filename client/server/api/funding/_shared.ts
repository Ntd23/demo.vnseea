// English description: Maps backend PHP funding API records into the funding bounded-context catalog shape.

import { createError, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient, normalizeBackendBaseURL } from "../../utils/backend-api-client"
import type { FundingCampaign, FundingCatalog, FundingTabKey } from "../../../src/funding/domain/types/funding.types"

type BackendEntity = Record<string, unknown>

type BackendFundingResponse = {
  api_status?: number | string
  can_create?: boolean
  currency?: string
  currency_symbol?: string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendMutationResponse = {
  api_status?: number | string
  message?: string
  errors?: {
    error_text?: string
  }
}

type BackendFundingDetailResponse = {
  api_status?: number | string
  can_create?: boolean
  currency?: string
  currency_symbol?: string
  data?: BackendEntity
  errors?: {
    error_text?: string
  }
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

const asBoolean = (value: unknown) => value === true || value === 1 || value === "1" || value === "true"

const normalizeUrl = (value: unknown, baseUrl: string) => {
  const raw = asString(value)
  if (!raw) return ""
  if (/^https?:\/\//i.test(raw)) return raw
  return `${baseUrl.replace(/\/+$/, "")}/${raw.replace(/^\/+/, "")}`
}

const formatBackendDate = (value: unknown) => {
  const timestamp = asNumber(value)
  if (!timestamp) return ""
  return new Date(timestamp * 1000).toISOString()
}

const mapFundingCampaign = (item: BackendEntity, baseUrl: string): FundingCampaign => {
  const user = (item.user_data ?? {}) as BackendEntity
  const id = asNumber(item.id)
  const progress = asNumber(item.bar)

  return {
    id,
    hashedId: asString(item.hashed_id) || String(id),
    title: asString(item.title),
    description: asString(item.description).replace(/<br\s*\/?>/gi, "\n"),
    imageUrl: normalizeUrl(item.image, baseUrl),
    ownerName: asString(user.name || user.username),
    ownerAvatarUrl: normalizeUrl(user.avatar, baseUrl),
    ownerUrl: asString(user.url),
    createdAt: formatBackendDate(item.time),
    amount: asNumber(item.amount),
    raised: asNumber(item.raised),
    progress: Math.max(0, Math.min(100, progress)),
    donated: asBoolean(item.is_donate),
    detailUrl: `/show_fund/${asString(item.hashed_id) || id}`,
  }
}

export async function fetchFundingCatalog(
  event: H3Event,
  query: { tab?: FundingTabKey; offset?: number | null; limit?: number },
): Promise<FundingCatalog> {
  const client = createBackendApiClient(event)
  const runtimeConfig = useRuntimeConfig(event)
  const baseUrl = normalizeBackendBaseURL(String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase))
  const type = query.tab === "mine" ? "user_funding" : "funding"
  const limit = query.limit && query.limit > 0 ? query.limit : 9
  const response = await client.post<BackendFundingResponse>("funding", {
    type,
    limit,
    offset: query.offset || 0,
  })

  const data = assertBackendApiSuccess(response, "Unable to load funding campaigns.")
  const items = (data.data ?? []).map(item => mapFundingCampaign(item, baseUrl))

  return {
    items,
    canCreate: Boolean(data.can_create),
    currency: asString(data.currency),
    currencySymbol: asString(data.currency_symbol),
    hasMore: items.length >= limit,
    nextOffset: items.length ? items[items.length - 1]!.id : null,
  }
}

export async function fetchFundingDetail(event: H3Event, id: string) {
  const client = createBackendApiClient(event)
  const runtimeConfig = useRuntimeConfig(event)
  const baseUrl = normalizeBackendBaseURL(String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase))
  const response = await client.post<BackendFundingDetailResponse>("funding", {
    type: "get_by_id",
    fund_id: id,
  })
  const data = assertBackendApiSuccess(response, "Unable to load funding campaign.")

  if (!data.data || Array.isArray(data.data)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Funding campaign not found.",
    })
  }

  return {
    campaign: mapFundingCampaign(data.data, baseUrl),
    canCreate: Boolean(data.can_create),
    currency: asString(data.currency),
    currencySymbol: asString(data.currency_symbol),
  }
}

export async function donateFundingCampaign(
  event: H3Event,
  body: { id?: number; amount?: number },
) {
  if (!body.id || !body.amount || body.amount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Funding id and amount are required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendMutationResponse>("funding", {
    type: "pay",
    id: body.id,
    amount: body.amount,
  })

  assertBackendApiSuccess(response, "Unable to donate to funding campaign.")

  return { ok: true }
}
