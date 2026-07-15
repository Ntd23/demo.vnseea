// English description: Returns the site-configured marketplace currencies as label/value pairs.

import { createBackendApiClient } from "../../utils/backend-api-client"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendCurrencyItem = {
  index?: number | string
  text?: string
  symbol?: string
}

type BackendSiteSettingsResponse = {
  api_status?: number | string
  currencies?: BackendCurrencyItem[]
}

export type CurrencyOption = {
  value: string
  label: string
  symbol: string
  code: string
}

const FALLBACK_CURRENCIES: CurrencyOption[] = [
  { value: "VND", label: "VND (₫)", symbol: "₫", code: "VND" },
  { value: "USD", label: "USD ($)", symbol: "$", code: "USD" },
]

/**
 * Decode HTML entities that PHP may encode in currency symbol strings.
 * e.g. &#8364; → €, &#165; → ¥, &amp; → &
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
}

export default defineEventHandler(async (event): Promise<CurrencyOption[]> => {
  try {
    const client = createBackendApiClient(event)
    const response = await client.post<BackendSiteSettingsResponse, Record<string, unknown>>(
      backendRoutes.api.siteSettings,
      {},
    )

    const rawCurrencies = Array.isArray(response?.currencies) ? response.currencies : []

    if (rawCurrencies.length === 0) {
      return FALLBACK_CURRENCIES
    }

    const mapped = rawCurrencies.map((item) => {
      const code = decodeHtmlEntities(String(item.text || "").trim()).toUpperCase()
      const symbol = decodeHtmlEntities(String(item.symbol || "").trim())
      return {
        value: code,
        label: code && symbol ? `${code} (${symbol})` : code || symbol,
        symbol,
        code,
      }
    }).filter(c => /^[A-Z]{3}$/.test(c.code))

    return mapped.length > 0 ? mapped : FALLBACK_CURRENCIES
  }
  catch {
    return FALLBACK_CURRENCIES
  }
})
