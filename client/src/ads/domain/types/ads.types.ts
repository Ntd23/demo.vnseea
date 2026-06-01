// English description: Defines ads manager domain records normalized from the backend advertising APIs.

export type AdsCampaignStatus = "active" | "inactive"

export type AdsCampaign = {
  id: number
  name: string
  websiteUrl: string
  headline: string
  description: string
  mediaUrl: string
  bidding: string
  placement: string
  location: string
  clicks: number
  views: number
  spent: number
  budget: number
  status: AdsCampaignStatus
  editUrl: string
  chartUrl: string
  audienceIds: string[]
  gender: string
  startDate: string
  endDate: string
  pageId: number
}

export type AdsManagerOverview = {
  campaigns: AdsCampaign[]
  balance: number
  currency: string
  currencySymbol: string
  hasMore: boolean
  nextOffset: number | null
  canCreateAds: boolean
}

export type AdsOptionItem = {
  value: string
  label: string
}

export type AdsPageOption = {
  id: number
  name: string
  slug: string
  url: string
}

export type AdsOptions = {
  audience: AdsOptionItem[]
  genders: AdsOptionItem[]
  placements: AdsOptionItem[]
  pages: AdsPageOption[]
  prices: {
    clicks: number
    views: number
    currency: string
    currencySymbol: string
  }
}

export type AdsCampaignDraft = {
  id?: number
  name: string
  websiteUrl: string
  headline: string
  description: string
  location: string
  audienceIds: string[]
  gender: string
  bidding: string
  placement: string
  startDate: string
  endDate: string
  budget: number | null
  page: string
  mediaFile: File | null
}

export type AdsMutationResult = {
  success: boolean
  message: string
  campaign?: AdsCampaign
}

export type AdsStatsPoint = {
  date: string
  clicks: number
  views: number
  spend: number
}

export type AdsCampaignStats = {
  campaign: AdsCampaign
  points: AdsStatsPoint[]
}
