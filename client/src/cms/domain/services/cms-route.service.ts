// English description: Normalizes CMS route parameters and canonical paths for public Nuxt pages.

import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { CmsPage, CmsPageKind, CmsTermsType } from "../types/cms.types"

const allowedTermTypes = new Set<CmsTermsType>(["terms", "privacy-policy", "about-us", "refund"])

const decodeSegment = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value
  const text = typeof raw === "string" || typeof raw === "number" ? String(raw) : ""

  try {
    return decodeURIComponent(text).trim()
  }
  catch {
    return text.trim()
  }
}

export const normalizeCmsTermsType = (value: unknown): CmsTermsType | "" => {
  const type = decodeSegment(value) as CmsTermsType

  return allowedTermTypes.has(type) ? type : ""
}

export const normalizeCmsPageName = (value: unknown) => decodeSegment(value)

export const getCmsPageCanonicalPath = (page: CmsPage) => {
  if (page.kind === "terms" && page.type) {
    return appRoutes.terms(page.type)
  }

  if (page.kind === "custom" && page.name) {
    return appRoutes.customPage(page.name)
  }

  return page.href.startsWith("/") ? page.href : `/${page.href}`
}

export const getCmsPageKey = (kind: CmsPageKind, identifier: string) =>
  `cms:${kind}:${identifier}`
