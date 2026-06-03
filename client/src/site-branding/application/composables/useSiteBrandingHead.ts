// English description: Applies backend-driven site branding to global Nuxt head metadata.

import { storeToRefs } from "pinia"
import { useSiteBrandingStore } from "../stores/useSiteBrandingStore"

const legacySuffixPattern = /\s\|\s[^|]+$/i

export function useSiteBrandingHead() {
  const store = useSiteBrandingStore()
  const { branding } = storeToRefs(store)

  useHead(() => {
    const siteName = branding.value.siteName || branding.value.siteTitle || "VNSEEA"
    const siteTitle = branding.value.siteTitle || siteName
    const siteDescription = branding.value.siteDescription || ""
    const faviconUrl = branding.value.faviconUrl || ""

    return {
      titleTemplate: (titleChunk?: string) => {
        const normalizedTitle = String(titleChunk || "")
          .replace(legacySuffixPattern, "")
          .trim()

        if (!siteTitle) {
          return normalizedTitle || siteName
        }

        if (!normalizedTitle || normalizedTitle === siteTitle) {
          return siteTitle
        }

        return `${normalizedTitle} | ${siteTitle}`
      },

      link: faviconUrl
        ? [
            {
              key: "site-favicon",
              rel: "icon",
              type: "image/png",
              href: faviconUrl,
            },
            {
              key: "site-shortcut-icon",
              rel: "shortcut icon",
              type: "image/png",
              href: faviconUrl,
            },
            {
              key: "site-apple-touch-icon",
              rel: "apple-touch-icon",
              href: faviconUrl,
            },
          ]
        : [],

      meta: [
        {
          key: "application-name",
          name: "application-name",
          content: siteName,
        },
        {
          key: "apple-mobile-web-app-title",
          name: "apple-mobile-web-app-title",
          content: siteName,
        },
        {
          key: "og-site-name",
          property: "og:site_name",
          content: siteName,
        },
        {
          key: "og-title",
          property: "og:title",
          content: siteTitle,
        },
        ...(siteDescription
          ? [
              {
                key: "description",
                name: "description",
                content: siteDescription,
              },
              {
                key: "og-description",
                property: "og:description",
                content: siteDescription,
              },
            ]
          : []),
      ],
    }
  })
}