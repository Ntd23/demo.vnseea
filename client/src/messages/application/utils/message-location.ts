// Description: Builds and parses the shared /map message contract used by the web and native chat clients.

import type { MessageItem } from "../../domain/types/messages.types"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { parseMessageLocationText } from "./message-location-parser"

export type MessageLocationMeta = {
  latitude: number
  longitude: number
  title: string
  address: string
  avatarUrl: string
  messageUrl: string
  webMapUrl: string
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
  const parsed = parseMessageLocationText(message.text)

  if (!parsed) {
    return null
  }

  const webMapUrl = new URL(appRoutes.searchNearby, "https://vnseea.invalid")
  webMapUrl.searchParams.set("lat", String(parsed.latitude))
  webMapUrl.searchParams.set("lng", String(parsed.longitude))
  if (parsed.title) webMapUrl.searchParams.set("title", parsed.title)
  if (parsed.address) webMapUrl.searchParams.set("address", parsed.address)
  if (parsed.avatarUrl) webMapUrl.searchParams.set("avatar", parsed.avatarUrl)
  webMapUrl.searchParams.set("source", "message")

  return {
    ...parsed,
    webMapUrl: `${webMapUrl.pathname}${webMapUrl.search}`,
  }
}
