// English description: Nuxt API implementation of the forum repository contract.

import type { ForumRepository } from "../../domain/repositories/ForumRepository"
import type { ForumCatalog, ForumCatalogQuery } from "../../domain/types/forum.types"

export class ApiForumRepository implements ForumRepository {
  async getCatalog(query: ForumCatalogQuery): Promise<ForumCatalog> {
    return await $fetch<ForumCatalog>("/_api/forum", { query })
  }
}
