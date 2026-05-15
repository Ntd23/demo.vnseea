// English description: Repository contract for loading and mutating backend-backed funding campaigns.

import type { FundingCatalog, FundingCatalogQuery } from "../types/funding.types"

export interface FundingRepository {
  getCatalog(query: FundingCatalogQuery): Promise<FundingCatalog>
  donate(payload: { id: number; amount: number }): Promise<void>
}
