export function formatHashtagLabel(value: string) {
  const trimmed = String(value || "").replace(/^#/, "").trim()
  return trimmed ? `#${trimmed}` : "#hashtag"
}
