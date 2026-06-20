// English description: Bridges Nuxt CMS page list requests to the PHP public CMS endpoint.

import { createBackendApiClient } from "../../utils/backend-api-client"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import type { CmsPageListItem } from "../../../src/cms/domain/types/cms.types"

type BackendCmsPageListItem = Record<string, unknown>

type BackendCmsPagesResponse = {
  api_status?: number | string
  pages?: BackendCmsPageListItem[]
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown) => {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

const normalizePage = (page: BackendCmsPageListItem): CmsPageListItem | null => {
  const name = asString(page.name ?? page.page_name)
  const title = asString(page.title ?? page.page_title)
  const href = asString(page.href)

  if (!name || !title) {
    return null
  }

  return {
    id: asNumber(page.id) || undefined,
    kind: "custom",
    name,
    title,
    href: href.startsWith("/") ? href : `/${href || `site-pages/${name}`}`,
  }
}

export default defineEventHandler(async (event): Promise<CmsPageListItem[]> => {
  const response = await createBackendApiClient(event).post<BackendCmsPagesResponse, Record<string, unknown>>(
    backendRoutes.api.cmsPages,
    {
      action: "pages",
    },
  )

  if (Number(response.api_status ?? 0) < 200 || Number(response.api_status ?? 0) >= 300) {
    return []
  }

  return Array.isArray(response.pages)
    ? response.pages.map(normalizePage).filter((page): page is CmsPageListItem => Boolean(page))
    : []
})
