// English description: Implements ads manager data access through the Nuxt API bridge.

import { apiRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"
import type { AdsRepository } from "../../domain/repositories/AdsRepository"
import type { AdsCampaign, AdsCampaignDraft, AdsCampaignStats, AdsManagerOverview, AdsMutationResult, AdsOptions } from "../../domain/types/ads.types"

const toCampaignFormData = (input: AdsCampaignDraft) => {
  const formData = new FormData()

  formData.set("name", input.name)
  formData.set("website", input.websiteUrl)
  formData.set("headline", input.headline)
  formData.set("description", input.description)
  formData.set("location", input.location)
  formData.set("audience-list", input.audienceIds.join(","))
  formData.set("gender", input.gender)
  formData.set("bidding", input.bidding)
  formData.set("appears", input.placement)
  formData.set("start", input.startDate)
  formData.set("end", input.endDate)
  formData.set("page", input.page)

  if (input.budget !== null && Number.isFinite(input.budget)) {
    formData.set("budget", String(input.budget))
  }

  if (input.mediaFile) {
    formData.set("media", input.mediaFile)
  }

  return formData
}

export function createApiAdsRepository(): AdsRepository {
  const api = useNuxtApiClient()

  return {
    getOverview(query) {
      return api.get<AdsManagerOverview>(apiRoutes.ads.list, query)
    },
    getOptions() {
      return api.get<AdsOptions>(apiRoutes.ads.options)
    },
    getCampaign(id) {
      return api.get<AdsCampaign>(apiRoutes.ads.detail(id))
    },
    getStats(id) {
      return api.get<AdsCampaignStats>(apiRoutes.ads.stats(id))
    },
    createCampaign(input) {
      return api.post<AdsMutationResult, FormData>(apiRoutes.ads.create, toCampaignFormData(input))
    },
    updateCampaign(id, input) {
      return api.put<AdsMutationResult, FormData>(apiRoutes.ads.detail(id), toCampaignFormData(input))
    },
    updateCampaignStatus(id, status) {
      return api.put<AdsMutationResult, { status: string }>(apiRoutes.ads.status(id), { status })
    },
    deleteCampaign(id) {
      return api.delete<AdsMutationResult>(apiRoutes.ads.detail(id))
    },
  }
}
