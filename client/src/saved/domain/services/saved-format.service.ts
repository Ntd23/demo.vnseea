export function formatSavedCount(value: number, locale: string) {
  return value.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")
}
