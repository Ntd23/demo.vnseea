export function normalizeLightboxIndex(index: number, total: number) {
  if (total === 0) return 0

  return ((index % total) + total) % total
}

export function createLightboxInitials(author: string) {
  const initials = author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "VN"
}
