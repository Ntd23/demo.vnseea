// English description: Maps backend offer records and proxies phtml-compatible offer mutations for Nuxt routes.

import { createError, getQuery, readMultipartFormData, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import type { Offer, OfferDiscountType, OfferListResponse, OfferMutationResult } from "../../../src/offer/domain/types/offer.types"

type BackendEntity = Record<string, unknown>
type BackendOfferResponse = {
  api_status?: number | string
  data?: BackendEntity | BackendEntity[]
  message?: string
  message_data?: string
  errors?: {
    error_text?: string
  }
}

const discountTypes: OfferDiscountType[] = [
  "discount_percent",
  "discount_amount",
  "buy_get_discount",
  "spend_get_off",
  "free_shipping",
]

const asRecord = (value: unknown): BackendEntity =>
  value && typeof value === "object" && !Array.isArray(value) ? value as BackendEntity : {}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value ?? 0)
  return Number.isFinite(normalized) ? normalized : 0
}

const firstString = (entity: BackendEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asString(entity[key])
    if (value) return value
  }

  return ""
}

const firstNumber = (entity: BackendEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asNumber(entity[key])
    if (value > 0) return value
  }

  return 0
}

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

const isPrivilegedUser = (user: BackendEntity) => {
  const adminLevel = Number(user.admin ?? 0)

  return adminLevel === 1 || adminLevel === 2
}

const normalizeDiscountType = (value: unknown): OfferDiscountType => {
  const normalized = asString(value) as OfferDiscountType

  return discountTypes.includes(normalized) ? normalized : "free_shipping"
}

const resolvePostPath = (offer: BackendEntity) => {
  const postId = firstNumber(offer, ["post_id", "postId"])
  const rawUrl = firstString(offer, ["url", "post_url"])

  if (postId > 0) return appRoutes.postDetail(postId)
  if (rawUrl && rawUrl.startsWith("/")) return rawUrl

  return appRoutes.offers
}

export const mapBackendOffer = (
  item: BackendEntity,
  currentUserId: number,
  isPrivileged: boolean,
  resolveMediaUrl: (value: unknown) => string,
): Offer => {
  const page = asRecord(item.page)
  const id = firstNumber(item, ["id", "offer_id"])
  const userId = firstNumber(item, ["user_id", "userId"])
  const pageId = firstNumber(item, ["page_id", "pageId"]) || firstNumber(page, ["page_id", "id"])

  return {
    id,
    pageId,
    userId,
    postId: firstNumber(item, ["post_id", "postId"]),
    postUrl: resolvePostPath(item),
    imageUrl: resolveMediaUrl(firstString(item, ["image", "image_url", "thumbnail"])),
    discountType: normalizeDiscountType(item.discount_type),
    discountPercent: asNumber(item.discount_percent),
    discountAmount: asNumber(item.discount_amount),
    buy: asNumber(item.buy),
    get: firstNumber(item, ["get_price", "get"]),
    spend: asNumber(item.spend),
    amountOff: asNumber(item.amount_off),
    currency: firstString(item, ["currency"]) || "0",
    offerText: firstString(item, ["offer_text", "offerText"]),
    discountedItems: firstString(item, ["discounted_items", "discountedItems"]),
    description: stripHtml(firstString(item, ["description"])),
    expireDate: firstString(item, ["expire_date", "expireDate"]),
    expireTime: firstString(item, ["expire_time", "expireTime"]),
    page: pageId > 0
      ? {
          id: pageId,
          name: firstString(page, ["page_title", "name", "page_name"]) || firstString(item, ["page_title"]),
          slug: firstString(page, ["page_name", "slug"]),
          avatarUrl: resolveMediaUrl(firstString(page, ["avatar", "avatar_full"])),
        }
      : null,
    canEdit: isPrivileged || (userId > 0 && userId === currentUserId),
    canDelete: isPrivileged || (userId > 0 && userId === currentUserId),
  }
}

export async function fetchOffers(event: H3Event): Promise<OfferListResponse> {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit ?? 10) || 10, 1), 50)
  const afterId = Number(query.afterId ?? 0) || 0
  const pageId = Number(query.pageId ?? 0) || 0
  const currentUser = await getBackendCurrentUser(event)
  const currentUserId = asNumber(currentUser.user_id)
  const isPrivileged = isPrivilegedUser(currentUser)
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendOfferResponse>("offer", {
      type: "get",
      limit,
      offset: afterId,
      page_id: pageId || undefined,
    }),
    "Unable to load offers.",
  )
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const offers = Array.isArray(response.data)
    ? response.data.map(item => mapBackendOffer(asRecord(item), currentUserId, isPrivileged, resolveMediaUrl)).filter(offer => offer.id > 0)
    : []

  return {
    offers,
    hasMore: offers.length >= limit,
    nextAfterId: offers.at(-1)?.id ?? null,
  }
}

const multipartString = (parts: Awaited<ReturnType<typeof readMultipartFormData>>, name: string) =>
  parts?.find(part => part.name === name && !part.filename)?.data.toString("utf8").trim() ?? ""

export async function readOfferFormData(event: H3Event, type: "create" | "edit", offerId?: number) {
  const parts = await readMultipartFormData(event) ?? []
  const formData = new FormData()
  const fieldMap: Record<string, string> = {
    pageId: "page_id",
    discountType: "discount_type",
    discountPercent: "discount_percent",
    discountAmount: "discount_amount",
    amountOff: "amount_off",
    discountedItems: "discounted_items",
    expireDate: "expire_date",
    expireTime: "expire_time",
  }

  formData.set("type", type)
  if (offerId) formData.set("offer_id", String(offerId))

  for (const part of parts) {
    if (!part.name) continue

    if (part.filename && part.name === "thumbnail") {
      formData.set("thumbnail", new Blob([part.data], { type: part.type || "application/octet-stream" }), part.filename)
      continue
    }

    if (part.filename) continue

    const backendKey = fieldMap[part.name] ?? part.name
    formData.set(backendKey, part.data.toString("utf8"))
  }

  if (type === "create") {
    const required = ["page_id", "discount_type", "currency", "description", "expire_date", "expire_time"]
    const missing = required.some(key => !asString(formData.get(key)))
    const hasThumbnail = parts.some(part => part.name === "thumbnail" && part.filename)

    if (missing || !hasThumbnail) {
      throw createError({
        statusCode: 400,
        statusMessage: "Please check your offer details.",
      })
    }
  }

  if (type === "edit" && !offerId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Offer id is required.",
    })
  }

  if (!multipartString(parts, "description") || multipartString(parts, "description").length < 32) {
    throw createError({
      statusCode: 400,
      statusMessage: "Description must be more than 32 characters.",
    })
  }

  return formData
}

export async function submitOfferForm(event: H3Event, formData: FormData): Promise<OfferMutationResult> {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendOfferResponse, FormData>("offer", formData),
    "Unable to save offer.",
  )
  const currentUser = await getBackendCurrentUser(event)
  const data = asRecord(response.data)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)

  return {
    ok: true,
    message: asString(response.message) || asString(response.message_data),
    offer: data.id
      ? mapBackendOffer(data, asNumber(currentUser.user_id), isPrivilegedUser(currentUser), resolveMediaUrl)
      : undefined,
    postId: firstNumber(data, ["post_id", "id"]),
  }
}

export async function deleteOffer(event: H3Event, offerId: number) {
  if (!offerId || offerId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Offer id is required.",
    })
  }

  assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendOfferResponse>("offer", {
      type: "delete",
      offer_id: offerId,
    }),
    "Unable to delete offer.",
  )
}
