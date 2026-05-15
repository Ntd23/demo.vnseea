// English description: Repository contract for loading backend-backed forum sections.

import type { ForumCatalog, ForumCatalogQuery } from "../types/forum.types"

export interface ForumRepository {
  getCatalog(query: ForumCatalogQuery): Promise<ForumCatalog>
}
