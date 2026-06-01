// English description: Applies backend-driven site branding to global Nuxt head metadata.

import { storeToRefs } from "pinia"
import { useSiteBrandingStore } from "../stores/useSiteBrandingStore"

const legacySuffixPattern = /\s\|\s[^|]+$/i

export function useSiteBrandingHead() {
  const store = useSiteBrandingStore()
  const { branding } = storeToRefs(store)

  useHead(() => {
    const siteName = branding.value.siteName || branding.value.siteTitle
    const siteTitle = branding.value.siteTitle || siteName
    const faviconUrl = branding.value.faviconUrl
    const meta: Array<Record<string, string>> = [
      ...(siteName
        ? [{
            property: "og:site_name",
            content: siteName,
          }]
        : []),
    ]

    return {
      titleTemplate: (titleChunk?: string) => {
        const normalizedTitle = String(titleChunk || "").replace(legacySuffixPattern, "").trim()

        if (!siteTitle) {
          return normalizedTitle
        }

        if (!normalizedTitle || normalizedTitle === siteTitle) {
          return siteTitle
        }

        return `${normalizedTitle} | ${siteTitle}`
      },
      link: [
        ...(faviconUrl
          ? [{
              key: "site-favicon",
              rel: "icon",
              href: faviconUrl,
            }]
          : []),
      ],
      meta,
    }
  })
}
