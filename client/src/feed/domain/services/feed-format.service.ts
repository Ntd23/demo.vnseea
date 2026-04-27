export function normalizeFeedTag(value: string) {
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
  const slug = normalizeFeedTag(value)
  return slug ? `/hashtag/${slug}` : "/search"
}
