// English description: Bridges Nuxt CMS page requests to the PHP public CMS endpoint.

import { createError, getQuery } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import type { CmsPage, CmsPageKind } from "../../../src/cms/domain/types/cms.types"

type BackendCmsPage = Record<string, unknown>

type BackendCmsPageResponse = {
  api_status?: number | string
  page?: BackendCmsPage
  errors?: {
    error_id?: number | string
    error_text?: string
  }
  message?: string
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown) => {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

const firstString = (source: BackendCmsPage, keys: string[]) => {
  for (const key of keys) {
    const value = asString(source[key])

    if (value) return value
  }

  return ""
}

const normalizeKind = (value: unknown): CmsPageKind => {
  const kind = asString(Array.isArray(value) ? value[0] : value)

  if (kind === "terms" || kind === "custom") {
    return kind
  }

  throw createError({
    statusCode: 400,
    statusMessage: "CMS page kind is invalid.",
  })
}

const normalizeParam = (value: unknown) =>
  asString(Array.isArray(value) ? value[0] : value)

const normalizePage = (page: BackendCmsPage): CmsPage => {
  const kind = normalizeKind(page.kind)
  const title = firstString(page, ["title", "page_title"])
  const contentHtml = firstString(page, ["content", "contentHtml", "page_content"])
  const type = firstString(page, ["type"])
  const name = firstString(page, ["name", "page_name"])
  const href = firstString(page, ["href"])
  const pageType = asNumber(page.page_type ?? page.pageType) === 1 ? 1 : 0

  if (!title) {
    throw createError({
      statusCode: 404,
      statusMessage: "CMS page not found.",
    })
  }

  return {
    id: asNumber(page.id) || undefined,
    kind,
    type: type || undefined,
    name: name || undefined,
    title,
    contentHtml,
    pageType,
    href: href.startsWith("/") ? href : `/${href}`,
  }
}

const assertCmsResponse = (response: BackendCmsPageResponse) => {
  const status = Number(response.api_status ?? 0)

  if (status >= 200 && status < 300 && response.page) {
    return response.page
  }

  const message = response.errors?.error_text || response.message || "CMS page not found."

  throw createError({
    statusCode: /not found/i.test(message) ? 404 : 400,
    statusMessage: message,
    data: response,
  })
}

export default defineEventHandler(async (event): Promise<CmsPage> => {
  const query = getQuery(event)
  const kind = normalizeKind(query.kind)
  const type = normalizeParam(query.type)
  const pageName = normalizeParam(query.pageName)

  if (kind === "terms" && !type) {
    throw createError({
      statusCode: 400,
      statusMessage: "CMS terms type is required.",
    })
  }

  if (kind === "custom" && !pageName) {
    throw createError({
      statusCode: 400,
      statusMessage: "CMS page name is required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendCmsPageResponse, Record<string, unknown>>(
    backendRoutes.api.cmsPages,
    {
      action: "page",
      kind,
      type,
      page_name: pageName,
    },
  )

  return normalizePage(assertCmsResponse(response))
})
