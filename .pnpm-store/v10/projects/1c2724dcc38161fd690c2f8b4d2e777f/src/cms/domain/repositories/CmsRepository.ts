// English description: Repository contract for public CMS pages sourced from the PHP backend.

import type { CmsPage, CmsPageListItem, CmsPageQuery } from "../types/cms.types"

export interface CmsRepository {
  getPage(query: CmsPageQuery): Promise<CmsPage>
  getPages(): Promise<CmsPageListItem[]>
}
