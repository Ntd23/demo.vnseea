import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { SearchRepository } from "../../domain/repositories/SearchRepository"
import type { SearchResultsByType } from "../../domain/types/search.types"

export function createApiSearchRepository(): SearchRepository {
  const client = useNuxtApiClient()

  return {
    async search(keyword: string, limit = 35): Promise<SearchResultsByType> {
      const query = keyword.trim()

      if (!query) {
        return {
          users: [],
          pages: [],
          groups: [],
          posts: [],
        }
      }

      return await client.get<SearchResultsByType>(apiRoutes.search.index, {
        q: query,
        limit,
      })
    },
  }
}
