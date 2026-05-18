// English description: Normalizes backend notification payloads for the Nuxt notification center.

import type { H3Event } from "h3"
import { createError } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendNotifier = {
  user_id?: number | string
  name?: string
  username?: string
  avatar?: string
}

type BackendNotification = {
  id?: number | string
  type?: string
  type_text?: string
  text?: string
  url?: string
  icon?: string
  seen?: number | string
  time?: number | string
  time_text?: string
  time_text_string?: string
  notifier?: BackendNotifier
}

type BackendGeneralDataResponse = {
  api_status?: number | string
  errors?: {
    error_text?: string
  }
  notifications?: BackendNotification[]
  new_notifications_count?: number | string
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeIcon = (icon: unknown) => {
  const value = asString(icon).toLowerCase()

  if (value.includes("comment")) {
    return "i-ph-chat-circle-text-duotone"
  }
  if (value.includes("thumb") || value.includes("like") || value.includes("reaction")) {
    return "i-ph-thumbs-up-duotone"
  }
  if (value.includes("user") || value.includes("follow")) {
    return "i-ph-user-plus-duotone"
  }
  if (value.includes("share")) {
    return "i-ph-share-fat-duotone"
  }
  if (value.includes("story")) {
    return "i-ph-play-circle-duotone"
  }
  if (value.includes("event") || value.includes("calendar")) {
    return "i-ph-calendar-dots-duotone"
  }
  if (value.includes("group")) {
    return "i-ph-users-three-duotone"
  }
  if (value.includes("page")) {
    return "i-ph-flag-duotone"
  }
  if (value.includes("blog") || value.includes("forum") || value.includes("thread")) {
    return "i-ph-newspaper-duotone"
  }
  if (value.includes("job")) {
    return "i-ph-briefcase-duotone"
  }
  if (value.includes("gift")) {
    return "i-ph-gift-duotone"
  }
  if (value.includes("memory")) {
    return "i-ph-clock-counter-clockwise-duotone"
  }
  if (value.includes("admin")) {
    return "i-ph-shield-star-duotone"
  }
  if (value.includes("money") || value.includes("wallet") || value.includes("bank")) {
    return "i-ph-wallet-duotone"
  }
  if (value.includes("fund") || value.includes("donate")) {
    return "i-ph-hand-heart-duotone"
  }

  return "i-ph-bell-duotone"
}

export const normalizeNotificationSummary = (event: H3Event, response: BackendGeneralDataResponse) => {
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const items = Array.isArray(response.notifications) ? response.notifications : []

  return {
    items: items.map((item) => {
      const notifierName = asString(item.notifier?.name)
      const body = asString(item.type_text) || asString(item.text)

      return {
        id: asString(item.id),
        type: asString(item.type),
        title: notifierName || "VNSEEA",
        body,
        url: asString(item.url) || "/notifications",
        avatarUrl: resolveMediaUrl(item.notifier?.avatar),
        icon: normalizeIcon(item.icon || item.type),
        isUnread: asNumber(item.seen) === 0,
        createdAt: asNumber(item.time),
        timeText: asString(item.time_text) || asString(item.time_text_string),
      }
    }).filter(item => item.id.length > 0),
    unreadCount: asNumber(response.new_notifications_count),
    hasMore: items.length >= 20,
    nextOffset: items.length > 0 ? asString(items[items.length - 1]?.id) || null : null,
  }
}

export async function fetchBackendNotifications(event: H3Event, options: { seen?: boolean, offset?: number | string } = {}) {
  const client = createBackendApiClient(event)

  const response = await client.post<BackendGeneralDataResponse>(
    backendRoutes.api.generalData,
    {
      fetch: "notifications",
      offset: options.offset || undefined,
      include_all_notifications: 1,
    },
    options.seen ? { seen: 1 } : undefined,
  )
  const apiStatus = asNumber(response.api_status)

  if (apiStatus < 200 || apiStatus >= 300) {
    throw createError({
      statusCode: apiStatus === 401 ? 401 : 400,
      statusMessage: response.errors?.error_text || "Unable to load notifications.",
      data: response,
    })
  }

  return response
}
