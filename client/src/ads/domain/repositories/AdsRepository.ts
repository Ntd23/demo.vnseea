// English description: Declares the ads manager repository contract used by the ads view-model.

import type { AdsCampaign, AdsCampaignDraft, AdsCampaignStats, AdsManagerOverview, AdsMutationResult, AdsOptions } from "../types/ads.types"

export interface AdsRepository {
  getOverview(query?: { offset?: number; limit?: number }): Promise<AdsManagerOverview>
  getOptions(): Promise<AdsOptions>
  getCampaign(id: number): Promise<AdsCampaign>
  getStats(id: number): Promise<AdsCampaignStats>
  createCampaign(input: AdsCampaignDraft): Promise<AdsMutationResult>
  updateCampaign(id: number, input: AdsCampaignDraft): Promise<AdsMutationResult>
  updateCampaignStatus(id: number, status: "active" | "inactive"): Promise<AdsMutationResult>
  deleteCampaign(id: number): Promise<AdsMutationResult>
}
