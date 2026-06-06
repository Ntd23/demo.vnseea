// English description: Implements the offer repository against Nuxt API bridge routes.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { OfferRepository } from "../../domain/repositories/OfferRepository"
import type { OfferDraft, OfferListResponse, OfferMutationResult } from "../../domain/types/offer.types"

const appendField = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return
  formData.append(key, String(value))
}

const toOfferFormData = (input: OfferDraft, includeCreateOnlyFields: boolean) => {
  const formData = new FormData()

  appendField(formData, "pageId", input.pageId)
  appendField(formData, "discountType", input.discountType)
  appendField(formData, "discountPercent", input.discountPercent)
  appendField(formData, "discountAmount", input.discountAmount)
  appendField(formData, "buy", input.buy)
  appendField(formData, "get", input.get)
  appendField(formData, "spend", input.spend)
  appendField(formData, "amountOff", input.amountOff)
  appendField(formData, "currency", input.currency)
  appendField(formData, "discountedItems", input.discountedItems)
  appendField(formData, "description", input.description)

  if (includeCreateOnlyFields) {
    appendField(formData, "expireDate", input.expireDate)
    appendField(formData, "expireTime", input.expireTime)
    if (input.thumbnailFile) {
      formData.append("thumbnail", input.thumbnailFile, input.thumbnailFile.name)
    }
  }

  return formData
}

export function createApiOfferRepository(): OfferRepository {
  const client = useNuxtApiClient()

  return {
    async getOffers(input = {}) {
      return await client.get<OfferListResponse>(apiRoutes.offers.list, {
        limit: input.limit,
        afterId: input.afterId,
        pageId: input.pageId,
      })
    },
    async createOffer(input) {
      return await client.post<OfferMutationResult, FormData>(
        apiRoutes.offers.list,
        toOfferFormData(input, true),
      )
    },
    async updateOffer(offerId, input) {
      return await client.put<OfferMutationResult, FormData>(
        apiRoutes.offers.detail(offerId),
        toOfferFormData(input, false),
      )
    },
    async deleteOffer(offerId) {
      await client.delete<void>(apiRoutes.offers.detail(offerId))
    },
  }
}
