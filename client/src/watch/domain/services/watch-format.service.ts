import type { WatchVideo } from "../types/watch.types"

export const formatWatchNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)

export function parseWatchDuration(duration: string) {
  const [minutes = "0", seconds = "0"] = duration.split(":")
  return Number(minutes) * 60 + Number(seconds)
}

export function videoMatchesKeyword(video: WatchVideo, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return true

  return [
    video.title,
    video.author,
    video.categoryLabel,
    video.description,
    ...video.tags,
  ].some(field => field.toLowerCase().includes(normalizedKeyword))
}
