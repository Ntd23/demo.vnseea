// Description: Parses native and web map URLs from chat text without depending on Nuxt runtime state.

export type ParsedMessageLocation = {
  latitude: number
  longitude: number
  title: string
  address: string
  avatarUrl: string
  messageUrl: string
}

const locationMessagePattern = /(?:https?:\/\/[^\s/]+)?\/map\?[^\s<]+/gi

function normalizeLocationTitle(value: string) {
  return value.replace(/\+/g, " ").trim()
}

function normalizeAvatarUrl(value: string) {
  const normalized = value.trim()
  return normalized.startsWith("/") || /^https?:\/\//i.test(normalized) ? normalized : ""
}

export function parseMessageLocationText(text: string): ParsedMessageLocation | null {
  const value = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/gi, "&")
    .trim()
  const candidates = value.match(locationMessagePattern) || []

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate, "https://vnseea.invalid")

      if (parsed.pathname.replace(/\/+$/, "") !== "/map") {
        continue
      }

      const latitudeValue = parsed.searchParams.get("lat")
      const longitudeValue = parsed.searchParams.get("lng")
      const latitude = Number(latitudeValue)
      const longitude = Number(longitudeValue)

      if (
        latitudeValue === null
        || longitudeValue === null
        || !Number.isFinite(latitude)
        || !Number.isFinite(longitude)
        || latitude < -90
        || latitude > 90
        || longitude < -180
        || longitude > 180
      ) {
        continue
      }

      return {
        latitude,
        longitude,
        title: normalizeLocationTitle(parsed.searchParams.get("title") || ""),
        address: normalizeLocationTitle(parsed.searchParams.get("address") || ""),
        avatarUrl: normalizeAvatarUrl(
          parsed.searchParams.get("avatar")
          || parsed.searchParams.get("image")
          || "",
        ),
        messageUrl: candidate,
      }
    }
    catch {
      continue
    }
  }

  return null
}
