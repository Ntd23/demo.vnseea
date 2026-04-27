import type { PhotoItem } from "../types/photos.types"

export const getPhotoEngagement = (
  photo: Pick<PhotoItem, "likes" | "comments">,
) => photo.likes + photo.comments * 2

export const formatPhotoNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)

export function normalizePhotoTag(value: string) {
  return String(value || "")
    .replace(/^#/, "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatHashtagLabel(value: string) {
  const trimmed = String(value || "").replace(/^#/, "").trim()
  return trimmed ? `#${trimmed}` : "#hashtag"
}

export function createHashtagPath(value: string) {
  const slug = normalizePhotoTag(value)
  return slug ? `/hashtag/${slug}` : "/search"
}

export function createPhotoInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
}
