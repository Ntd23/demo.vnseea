// English description: Creates offer form drafts with phtml-compatible defaults.

import type { Offer, OfferDraft } from "../../domain/types/offer.types"

export const createOfferDraft = (pageId = 0): OfferDraft => ({
  pageId,
  discountType: "discount_percent",
  discountPercent: 1,
  discountAmount: "",
  buy: "",
  get: "",
  spend: "",
  amountOff: "",
  currency: "0",
  discountedItems: "",
  description: "",
  expireDate: "",
  expireTime: "",
  thumbnailFile: null,
})

export const createOfferDraftFromOffer = (offer: Offer): OfferDraft => ({
  pageId: offer.pageId,
  discountType: offer.discountType,
  discountPercent: offer.discountPercent || 1,
  discountAmount: offer.discountAmount ? String(offer.discountAmount) : "",
  buy: offer.buy ? String(offer.buy) : "",
  get: offer.get ? String(offer.get) : "",
  spend: offer.spend ? String(offer.spend) : "",
  amountOff: offer.amountOff ? String(offer.amountOff) : "",
  currency: offer.currency || "0",
  discountedItems: offer.discountedItems,
  description: offer.description,
  expireDate: offer.expireDate,
  expireTime: offer.expireTime,
  thumbnailFile: null,
})
