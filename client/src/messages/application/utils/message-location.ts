// Description: Builds and parses the shared /map message contract used by the web and native chat clients.

import type { MessageItem } from "../../domain/types/messages.types"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"

export type MessageLocationMeta = {
  latitude: number
  longitude: number
  title: string
  avatarUrl: string
  messageUrl: string
  webMapUrl: string
}

const locationMessagePattern = /^(?:https?:\/\/[^\s/]+)?\/map\?[^\s]+$/i

function normalizeLocationTitle(value: string) {
  return value.replace(/\+/g, " ").trim()
}

function normalizeAvatarUrl(value: string) {
  const normalized = value.trim()
  return normalized.startsWith("/") || /^https?:\/\//i.test(normalized) ? normalized : ""
}

export function buildLocationMessageUrl(input: {
  latitude: number
  longitude: number
  title: string
  siteUrl: string
  avatarUrl?: string
}) {
  const fallbackBase = import.meta.client ? window.location.origin : "https://vnseea.invalid"
  const url = new URL("/map", input.siteUrl.trim() || fallbackBase)

  url.searchParams.set("lat", input.latitude.toFixed(6))
  url.searchParams.set("lng", input.longitude.toFixed(6))
  url.searchParams.set("title", input.title.trim())

  if (input.avatarUrl?.trim()) {
    try {
      url.searchParams.set("avatar", new URL(input.avatarUrl.trim(), url.origin).toString())
    }
    catch {
      url.searchParams.set("avatar", input.avatarUrl.trim())
    }
  }

  return url.toString()
}

export function getMessageLocationMeta(message: Pick<MessageItem, "text">): MessageLocationMeta | null {
  const value = message.text
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&amp;/gi, "&")
    .trim()

  if (!locationMessagePattern.test(value)) {
    return null
  }

  try {
    const parsed = new URL(value, "https://vnseea.invalid")

    if (parsed.pathname.replace(/\/+$/, "") !== "/map") {
      return null
    }

    const latitude = Number(parsed.searchParams.get("lat"))
    const longitude = Number(parsed.searchParams.get("lng"))

    if (
      !Number.isFinite(latitude)
      || !Number.isFinite(longitude)
      || latitude < -90
      || latitude > 90
      || longitude < -180
      || longitude > 180
    ) {
      return null
    }

    const title = normalizeLocationTitle(parsed.searchParams.get("title") || "")
    const avatarUrl = normalizeAvatarUrl(parsed.searchParams.get("avatar") || "")
    const webMapUrl = new URL(appRoutes.searchNearby, "https://vnseea.invalid")
    webMapUrl.searchParams.set("lat", String(latitude))
    webMapUrl.searchParams.set("lng", String(longitude))
    if (title) webMapUrl.searchParams.set("title", title)
    webMapUrl.searchParams.set("source", "message")

    return {
      latitude,
      longitude,
      title,
      avatarUrl,
      messageUrl: value,
      webMapUrl: `${webMapUrl.pathname}${webMapUrl.search}`,
    }
  }
  catch {
    return null
  }
}
