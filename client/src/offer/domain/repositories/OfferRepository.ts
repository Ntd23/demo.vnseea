// English description: Repository contract for listing and mutating backend-backed page offers.

import type { Offer, OfferDraft, OfferListResponse, OfferMutationResult } from "../types/offer.types"

export interface OfferRepository {
  getOffers(input?: { limit?: number; afterId?: number; pageId?: number }): Promise<OfferListResponse>
  createOffer(input: OfferDraft): Promise<OfferMutationResult>
  updateOffer(offerId: number, input: OfferDraft): Promise<OfferMutationResult>
  deleteOffer(offerId: number): Promise<void>
}
