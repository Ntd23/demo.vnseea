export type FundingCategoryKey = "community" | "education" | "health" | "environment" | "startup"
export type FundingStatusKey = "all" | "active" | "ending" | "funded" | "mine"

export type FundingOption<T extends string = string> = {
  label: string
  value: T
  icon: string
}

export type FundingDonor = {
  id: number
  name: string
  initials: string
  gradient: string
  amount: number
  message: string
  donatedAt: string
}

export type MockFundingCampaign = {
  id: string
  title: string
  category: FundingCategoryKey
  categoryLabel: string
  owner: string
  ownerInitials: string
  ownerGradient: string
  location: string
  goalAmount: number
  raisedAmount: number
  backers: number
  daysLeft: number
  status: Exclude<FundingStatusKey, "all">
  cover: string
  coverFallback: string
  summary: string
  description: string
  impact: string[]
  rewards: string[]
  donors: FundingDonor[]
  isOwner: boolean
  isFeatured: boolean
}

export type DonationPayload = {
  campaignId: string
  amount: number
  paymentMethod: "wallet" | "card" | "bank"
  message: string
}

export type FundingCreatePayload = {
  title: string
  category: FundingCategoryKey
  goalAmount: number
  imageName: string
  description: string
}

export type FundingDonationPresentation = {
  supporterName: string
  supporterInitials: string
  fallbackMessage: string
  donatedAt: string
  gradient?: string
}
