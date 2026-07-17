// English description: Loads Activity Center pages through the authenticated Nuxt BFF.
import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { ActivityRepository } from "../../domain/repositories/ActivityRepository"
import type { PostActivityPage } from "../../domain/types/activity.types"

export function createApiActivityRepository(): ActivityRepository {
  const client = useNuxtApiClient()
  return {
    async getPostActivity(input) {
      return await client.get<PostActivityPage>(apiRoutes.activity.posts, {
        category: input.category,
        limit: input.limit ?? 20,
        ...(input.cursor ? { cursor: input.cursor } : {}),
      })
    },
  }
}
