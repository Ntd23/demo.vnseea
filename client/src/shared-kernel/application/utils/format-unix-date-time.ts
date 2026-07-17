// English description: Formats backend Unix timestamps consistently while preserving already formatted time labels.

export const formatUnixDateTime = (
  value: string | number | null | undefined,
  locale = "vi",
  timeZone = "Asia/Ho_Chi_Minh",
) => {
  const normalized = String(value ?? "").trim()

  if (!/^\d{10,13}$/.test(normalized)) return normalized

  const numeric = Number(normalized)
  const timestamp = numeric > 9_999_999_999 ? numeric : numeric * 1000
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) return normalized

  const parts = new Intl.DateTimeFormat(locale.startsWith("vi") ? "vi-VN" : "en-US", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const readPart = (type: string) =>
    parts.find(part => part.type === type)?.value ?? ""
  const day = readPart("day")
  const month = readPart("month")
  const year = readPart("year")
  const hour = readPart("hour")
  const minute = readPart("minute")

  if (!day || !month || !year || !hour || !minute) return normalized

  const dateLabel = locale.startsWith("vi")
    ? `${day}/${month}/${year}`
    : `${month}/${day}/${year}`

  return `${hour}:${minute} ${dateLabel}`
}
