// English description: Nuxt API implementation of the funding repository contract.

import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { FundingRepository } from "../../domain/repositories/FundingRepository"
import type {
  FundingCatalog,
  FundingCatalogQuery,
  FundingCreateInput,
  FundingDetail,
  FundingUpdateInput,
} from "../../domain/types/funding.types"

export class ApiFundingRepository implements FundingRepository {
  private readonly api = useNuxtApiClient()

  async getCatalog(query: FundingCatalogQuery): Promise<FundingCatalog> {
    return await this.api.get<FundingCatalog>("/funding", query)
  }

  async getCampaign(id: string): Promise<FundingDetail> {
    return await this.api.get<FundingDetail>(`/funding/${id}`)
  }

  async createCampaign(input: FundingCreateInput) {
    const form = new FormData()
    form.append("title", input.title)
    form.append("amount", String(input.amount))
    form.append("description", input.description)
    form.append("image", input.image)

    await this.api.post("/funding/create", form)
  }

  async updateCampaign(id: number, input: FundingUpdateInput) {
    await this.api.patch(`/funding/${id}`, input)
  }

  async donate(payload: { id: number; amount: number }) {
    await this.api.post("/funding/donate", payload)
  }

  async deleteCampaign(id: number) {
    await this.api.delete(`/funding/${id}`)
  }
}

export const createApiFundingRepository = () => new ApiFundingRepository()
