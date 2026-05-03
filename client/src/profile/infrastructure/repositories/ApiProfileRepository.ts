// English description: Nuxt API backed repository for profile pages without local mock fallbacks.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { ProfileRepository } from "../../domain/repositories/ProfileRepository"
import type { ProfileApiResponse } from "../../domain/types/profile.types"

export function createApiProfileRepository(): ProfileRepository {
  const client = useNuxtApiClient()

  return {
    async getProfileByUsername(username: string) {
      return await client.get<ProfileApiResponse | null>(apiRoutes.profile.byUsername(username))
    },
  }
}

