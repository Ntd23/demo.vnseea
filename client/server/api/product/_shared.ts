// English description: Product API bridge helpers that normalize PHP product responses.

import { createError, getCookie, type H3Event } from "h3"
import { getBackendBaseCandidates } from "../../utils/backend-api-client"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import type {
  ProductListing,
  ProductListingCategory,
  ProductMarketplaceResponse,
} from "../../../src/product/domain/types/product-marketplace.types"
import type { ProductRecord, ProductCategory, ProductCondition, ProductCurrency } from "../../../src/product/domain/types/product-editor.types"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendProduct = {
  id?: number | string
  name?: string
  description?: string
  price?: number | string
  currency?: string | number
  location?: string
  category?: string | number
  category_name?: string
  type?: number | string
  time?: number | string
  time_text?: string
  distance?: number | string
  rating?: number | string
  images?: Array<string | { id?: number | string; image?: string; image_org?: string }>
  seller?: {
    user_id?: number | string
    name?: string
    username?: string
  }
  user_data?: {
    user_id?: number | string
    name?: string
    username?: string
  }
}

type BackendProductsResponse = {
  api_status?: number | string
  products?: BackendProduct[]
  message?: string
  errors?: { error_text?: string }
}

type BackendCurrentUserResponse = {
  api_status?: number | string
  user_data?: {
    user_id?: number | string
  }
}

const categoryVisuals: Record<ProductListingCategory, { icon: string; background: string }> = {
  vehicles: { icon: "i-ph-car-profile", background: "linear-gradient(135deg,#172554 0%,#1d4ed8 48%,#7dd3fc 100%)" },
  home: { icon: "i-ph-armchair", background: "linear-gradient(135deg,#78350f 0%,#b45309 38%,#f59e0b 100%)" },
  beauty: { icon: "i-ph-drop", background: "linear-gradient(135deg,#0369a1 0%,#38bdf8 45%,#bae6fd 100%)" },
  books: { icon: "i-ph-book-open-text", background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 38%,#bfdbfe 100%)" },
  tech: { icon: "i-ph-device-mobile-camera", background: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)" },
  food: { icon: "i-ph-bowl-food", background: "linear-gradient(135deg,#7c2d12 0%,#ea580c 40%,#fdba74 100%)" },
}

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return fallback
}

const stripHtml = (value: unknown) =>
  asString(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

const normalizeCurrency = (value: unknown) => {
  const currency = asString(value, "VND").toUpperCase()
  return /^[A-Z]{3}$/.test(currency) ? currency : "VND"
}

const inferCategory = (product: BackendProduct): ProductListingCategory => {
  const source = `${asString(product.category_name)} ${asString(product.category)}`.toLowerCase()

  if (/car|vehicle|auto|bike|moto|xe/.test(source)) return "vehicles"
  if (/beauty|health|fashion|làm đẹp|thời trang/.test(source)) return "beauty"
  if (/book|sách/.test(source)) return "books"
  if (/tech|phone|computer|laptop|điện tử/.test(source)) return "tech"
  if (/food|drink|ăn|uống/.test(source)) return "food"
  return "home"
}

const getProductImage = (event: H3Event, product: BackendProduct) => {
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  const image = typeof firstImage === "string" ? firstImage : firstImage?.image_org || firstImage?.image

  return resolveMediaUrl(image) || undefined
}

export const normalizeProductsResponse = (
  event: H3Event,
  response: BackendProductsResponse,
  limit: number,
): ProductMarketplaceResponse => {
  const status = Number(response.api_status ?? 0)

  if (status < 200 || status >= 300) {
    throw createError({
      statusCode: 400,
      statusMessage: response.errors?.error_text || response.message || "Unable to load products.",
    })
  }

  const products = Array.isArray(response.products) ? response.products : []
  const items: ProductListing[] = products.map((product) => {
    const category = inferCategory(product)
    const visuals = categoryVisuals[category]
    const seller = product.seller || product.user_data
    const time = asNumber(product.time)
    const postedHoursAgo = time > 0 ? Math.max(0, Math.round((Date.now() / 1000 - time) / 3600)) : 0

    return {
      id: asNumber(product.id),
      title: asString(product.name),
      seller: asString(seller?.name) || asString(seller?.username),
      price: asNumber(product.price),
      currency: normalizeCurrency(product.currency),
      imageUrl: getProductImage(event, product),
      location: asString(product.location),
      distanceKm: asNumber(product.distance),
      category,
      categoryLabel: asString(product.category_name) || asString(product.category, category),
      condition: asNumber(product.type) === 1 ? "Used" : "New",
      description: stripHtml(product.description),
      background: visuals.background,
      icon: visuals.icon,
      postedHoursAgo,
      postedLabel: asString(product.time_text),
      rating: asNumber(product.rating),
      mine: false,
    }
  }).filter(product => product.id > 0 && product.title)

  const lastItem = items.at(-1)

  return {
    items,
    hasMore: items.length >= limit,
    nextOffset: lastItem?.id ?? null,
  }
}

export const normalizeProductRecord = (event: H3Event, product: BackendProduct): ProductRecord => {
  const category = inferCategory(product)
  const condition: ProductCondition = asNumber(product.type) === 1 ? "used" : "new"
  const currency = normalizeCurrency(product.currency) as ProductCurrency
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const images = (Array.isArray(product.images) ? product.images : []).map((image, index) => {
    const imageId = typeof image === "string" ? `${asString(product.id)}-${index}` : asString(image.id, `${asString(product.id)}-${index}`)
    const imagePath = typeof image === "string" ? image : image.image_org || image.image

    return {
      id: imageId,
      src: resolveMediaUrl(imagePath),
      alt: asString(product.name),
    }
  }).filter(image => image.src)

  return {
    id: asString(product.id),
    title: asString(product.name),
    description: stripHtml(product.description),
    category: category as ProductCategory,
    condition,
    location: asString(product.location),
    currency,
    price: asNumber(product.price),
    stock: asNumber((product as { units?: unknown }).units),
    images,
    updatedAt: asString(product.time_text) || asString(product.time),
  }
}

export const assertBackendOk = (response: { api_status?: number | string; count?: number | string; message?: string; errors?: { error_text?: string } }) => {
  const status = Number(response.api_status ?? 0)

  if (status < 200 || status >= 300) {
    throw createError({
      statusCode: 400,
      statusMessage: response.errors?.error_text || response.message || "Unable to update product.",
    })
  }
}

export const getBackendCurrentUserId = async (event: H3Event) => {
  const backendUserSession = getCookie(event, "user_id")

  if (!backendUserSession) {
    return ""
  }

  const runtimeConfig = useRuntimeConfig(event)
  const baseCandidates = getBackendBaseCandidates(
    String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase),
  )

  for (const baseURL of baseCandidates) {
    try {
      const response = await $fetch<BackendCurrentUserResponse>(backendRoutes.session.currentUser(backendUserSession), {
        baseURL,
      })
      const userId = asString(response.user_data?.user_id)

      if (userId) {
        return userId
      }
    }
    catch {
      // Try the next configured backend base.
    }
  }

  return ""
}
