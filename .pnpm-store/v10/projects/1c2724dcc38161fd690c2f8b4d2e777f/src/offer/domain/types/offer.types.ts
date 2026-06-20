// English description: Defines offer records, drafts, discount types, and list responses for the Nuxt offer context.

export type OfferDiscountType =
  | "discount_percent"
  | "discount_amount"
  | "buy_get_discount"
  | "spend_get_off"
  | "free_shipping"

export interface OfferPageSummary {
  id: number
  name: string
  slug: string
  avatarUrl?: string
}

export interface Offer {
  id: number
  pageId: number
  userId: number
  postId: number
  postUrl: string
  imageUrl: string
  discountType: OfferDiscountType
  discountPercent: number
  discountAmount: number
  buy: number
  get: number
  spend: number
  amountOff: number
  currency: string
  offerText: string
  discountedItems: string
  description: string
  expireDate: string
  expireTime: string
  page: OfferPageSummary | null
  canEdit: boolean
  canDelete: boolean
}

export interface OfferDraft {
  pageId: number
  discountType: OfferDiscountType
  discountPercent: number
  discountAmount: string
  buy: string
  get: string
  spend: string
  amountOff: string
  currency: string
  discountedItems: string
  description: string
  expireDate: string
  expireTime: string
  thumbnailFile?: File | null
}

export interface OfferListResponse {
  offers: Offer[]
  hasMore: boolean
  nextAfterId: number | null
}

export interface OfferMutationResult {
  ok: boolean
  offer?: Offer
  postId?: number
  message?: string
}
