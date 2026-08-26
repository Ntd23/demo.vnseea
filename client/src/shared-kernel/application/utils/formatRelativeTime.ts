// English description: Formats backend timestamps into calendar-aware relative labels in the viewer's local timezone.

export type RelativeTimeLabels = {
  justNow: string
  today: string
  thisWeek: string
}

type RelativeTimeOptions = {
  locale: string
  labels: RelativeTimeLabels
  now?: number
}

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS

export function parseBackendTimestamp(value: string | number): Date | null {
  const normalized = String(value).trim()

  if (!normalized) {
    return null
  }

  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    const numericValue = Number(normalized)

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return null
    }

    const timestampMs = numericValue < 1_000_000_000_000
      ? numericValue * SECOND_MS
      : numericValue
    const date = new Date(timestampMs)

    return Number.isNaN(date.getTime()) ? null : date
  }

  if (!/^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(normalized)) {
    return null
  }

  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatRelativeTime(value: string | number, options: RelativeTimeOptions): string {
  const date = parseBackendTimestamp(value)

  if (!date) {
    return ""
  }

  const now = new Date(options.now ?? Date.now())
  const elapsedMs = Math.max(0, now.getTime() - date.getTime())
  const relativeFormatter = new Intl.RelativeTimeFormat(options.locale, { numeric: "always" })

  if (elapsedMs < 45 * SECOND_MS) {
    return options.labels.justNow
  }

  if (elapsedMs < HOUR_MS) {
    return relativeFormatter.format(-Math.max(1, Math.floor(elapsedMs / MINUTE_MS)), "minute")
  }

  if (elapsedMs < 6 * HOUR_MS) {
    return relativeFormatter.format(-Math.max(1, Math.floor(elapsedMs / HOUR_MS)), "hour")
  }

  if (isSameLocalDay(date, now)) {
    return options.labels.today
  }

  const elapsedDays = Math.max(1, getLocalCalendarDayDifference(date, now))

  if (elapsedDays < 3) {
    return relativeFormatter.format(-elapsedDays, "day")
  }

  if (isSameLocalWeek(date, now, getWeekStartsOn(options.locale))) {
    return options.labels.thisWeek
  }

  if (elapsedDays < 30) {
    const elapsedWeeks = Math.max(1, Math.floor(elapsedDays / 7))
    return relativeFormatter.format(-elapsedWeeks, "week")
  }

  const elapsedMonths = Math.max(1, getLocalCalendarMonthDifference(date, now))

  if (elapsedMonths < 12) {
    return relativeFormatter.format(-elapsedMonths, "month")
  }

  const elapsedYears = Math.max(1, now.getFullYear() - date.getFullYear())
  return relativeFormatter.format(-elapsedYears, "year")
}

export function formatAbsoluteLocalTime(value: string | number, locale: string): string {
  const date = parseBackendTimestamp(value)

  if (!date) {
    return ""
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatTimestampAsIso(value: string | number): string {
  return parseBackendTimestamp(value)?.toISOString() ?? ""
}

function isSameLocalDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

function getLocalCalendarDayDifference(earlier: Date, later: Date): number {
  const earlierUtcDay = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())
  const laterUtcDay = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate())
  return Math.floor((laterUtcDay - earlierUtcDay) / (24 * HOUR_MS))
}

function getLocalCalendarMonthDifference(earlier: Date, later: Date): number {
  return (later.getFullYear() - earlier.getFullYear()) * 12
    + later.getMonth()
    - earlier.getMonth()
}

function getWeekStartsOn(locale: string): 0 | 1 {
  return locale.toLowerCase().startsWith("en-us") ? 0 : 1
}

function isSameLocalWeek(left: Date, right: Date, weekStartsOn: 0 | 1): boolean {
  return getLocalWeekStart(left, weekStartsOn).getTime() === getLocalWeekStart(right, weekStartsOn).getTime()
}

function getLocalWeekStart(value: Date, weekStartsOn: 0 | 1): Date {
  const start = new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const offset = (start.getDay() - weekStartsOn + 7) % 7
  start.setDate(start.getDate() - offset)
  return start
}
