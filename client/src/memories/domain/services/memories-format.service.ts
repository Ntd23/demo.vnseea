export function formatMemoryCount(value: number, locale: string) {
  return value.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")
}
