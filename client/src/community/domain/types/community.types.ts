export type CommunityPrivacy = "public" | "private" | "secret"

export interface CommunityOption {
  label: string
  value: string
  description?: string
  icon?: string
}

export interface CommunityDraft {
  name: string
  slug: string
  description: string
  privacy: CommunityPrivacy
  category: string
}

export type CommunityGroupTab = "mine" | "suggested" | "joined"
export type CommunityPageTab = "mine" | "suggested" | "favorite"

export interface CommunityPageRecord {
  id: number
  name: string
  slug: string
  summary: string
  category: string
  banner: string
  accent: string
  followers: number
  likes: number
  ownerLabel: string
  responseLabel: string
  website?: string
  locationLabel?: string
  foundedLabel?: string
  ctaLabel?: string
  canManage?: boolean
  directoryTabs?: Exclude<CommunityPageTab, "mine">[]
  tags: string[]
  following?: boolean
}

export interface CommunityGroupRecord {
  id: number
  name: string
  slug: string
  summary: string
  members: number
  privacy: CommunityPrivacy
  category: string
  banner: string
  accent: string
  segment: Exclude<CommunityGroupTab, "mine">
  activityLabel: string
  ownerLabel: string
  tags: string[]
  website?: string
  locationLabel?: string
  foundedLabel?: string
  canManage?: boolean
  joinLabel?: string
  inviteLabel?: string
  guidelines?: string[]
  joined?: boolean
}

export interface CommunityGroupMember {
  id: number
  name: string
  initials: string
  role: string
  meta: string
  online?: boolean
}

export interface CommunityGroupSettingsDraft {
  name: string
  slug: string
  summary: string
  website: string
  locationLabel: string
  privacy: CommunityPrivacy
  category: string
  tags: string
  guidelines: string
  joinApproval: boolean
  postApproval: boolean
  allowMemberInvites: boolean
  showMemberDirectory: boolean
  welcomePostEnabled: boolean
}

export interface CommunityPageSettingsDraft {
  name: string
  slug: string
  summary: string
  website: string
  locationLabel: string
  category: string
  ctaLabel: string
  responseLabel: string
  ownerLabel: string
  tags: string
  allowMessages: boolean
  showFollowerCount: boolean
  showLikeCount: boolean
  showWebsite: boolean
  recommendRelatedPages: boolean
}
