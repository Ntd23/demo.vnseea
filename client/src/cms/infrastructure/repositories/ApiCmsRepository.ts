// English description: Nuxt API backed repository for public CMS pages.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { CmsRepository } from "../../domain/repositories/CmsRepository"
import type { CmsPage, CmsPageListItem, CmsPageQuery } from "../../domain/types/cms.types"

export function createApiCmsRepository(): CmsRepository {
  const client = useNuxtApiClient()

  return {
    getPage: query => client.get<CmsPage>(apiRoutes.cms.page, {
      kind: query.kind,
      type: query.type,
      pageName: query.pageName,
    }),
    getPages: () => client.get<CmsPageListItem[]>(apiRoutes.cms.pages),
  }
}
