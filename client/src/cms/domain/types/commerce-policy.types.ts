export type CommercePolicySlug = "general" | "shipping" | "returns" | "privacy"

export interface CommercePolicySection {
  heading: string
  paragraphs?: string[]
  items?: string[]
}

export interface CommercePolicy {
  slug: CommercePolicySlug
  title: string
  summary: string
  updatedAt: string
  sections: CommercePolicySection[]
}
