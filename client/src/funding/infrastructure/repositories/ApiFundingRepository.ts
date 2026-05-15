// English description: Nuxt API implementation of the funding repository contract.

import type { FundingRepository } from "../../domain/repositories/FundingRepository"
import type { FundingCatalog, FundingCatalogQuery } from "../../domain/types/funding.types"

export class ApiFundingRepository implements FundingRepository {
  async getCatalog(query: FundingCatalogQuery): Promise<FundingCatalog> {
    return await $fetch<FundingCatalog>("/_api/funding", { query })
  }

  async donate(payload: { id: number; amount: number }) {
    await $fetch("/_api/funding/donate", {
      method: "POST",
      body: payload,
    })
  }
}
