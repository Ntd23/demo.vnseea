// English description: Connects the poke bounded context to the Nuxt API bridge.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { PokeRepository } from "../../domain/repositories/PokeRepository"
import type { PokeActionResult, PokeRecord } from "../../domain/types/poke.types"

export function createApiPokeRepository(): PokeRepository {
  const client = useNuxtApiClient()

  return {
    async getPokes() {
      return await client.get<PokeRecord[]>(apiRoutes.feed.poke)
    },
    async runPokeAction(input) {
      return await client.post<PokeActionResult, Record<string, unknown>>(
        apiRoutes.feed.poke,
        input,
      )
    },
  }
}
