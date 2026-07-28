// English description: Defines normalized community group and page domain records used by Nuxt API-backed screens.

import type { LocationSelection } from "../../../location/domain/types/location.types"

export type CommunityPrivacy = "public" | "private" | "secret"
export type CommunityPageMapPinStatus = "none" | "pending" | "approved" | "rejected"

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
  location?: LocationSelection
  mapPinRequested?: boolean
}

export type CommunityGroupTab = "mine" | "suggested" | "joined"
export type CommunityPageTab = "mine" | "suggested" | "favorite"

export interface CommunityPageRecord {
  id: number
  ownerId?: number
  name: string
  slug: string
  summary: string
  category: string
  categoryLabel?: string
  banner: string
  avatarUrl?: string
  accent: string
  followers: number
  likes: number
  postCount?: number
  ownerLabel: string
  responseLabel: string
  website?: string
  locationLabel?: string
  lat?: number | null
  lng?: number | null
  placeId?: string
  mapPinStatus?: CommunityPageMapPinStatus
  foundedLabel?: string
  ctaLabel?: string
  canManage?: boolean
  directoryTabs?: Exclude<CommunityPageTab, "mine">[]
  tags: string[]
  following?: boolean
  liked?: boolean
}

export interface CommunityPageFollowerRecord {
  id: number
  username: string
  name: string
  avatarUrl?: string
  verified?: boolean
  isFriend: boolean
  isRequested: boolean
}

export type CommunityPageAnalyticsPeriod = "day" | "week" | "month" | "year"

export interface CommunityPageAnalyticsStat {
  key: string
  label: string
  value: string
  rawValue: number
  icon: string
  color: string
}

export interface CommunityPageAnalyticsPoint {
  label: string
  likes: number
  views: number
  interactions: number
}

export interface CommunityPageAnalyticsOverview {
  period: CommunityPageAnalyticsPeriod
  likes: number
  likesInPeriod: number
  followers: number
  posts: number
  postsInPeriod: number
  interactions: number
  views: number
  engagementRate: number
  hasViewSource: boolean
  stats: CommunityPageAnalyticsStat[]
  chart: CommunityPageAnalyticsPoint[]
}

export interface CommunityGroupRecord {
  id: number
  name: string
  slug: string
  summary: string
  members: number
  privacy: CommunityPrivacy
  category: string
  categoryLabel?: string
  banner: string
  avatar?: string
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
  requested?: boolean
  joinApproval?: boolean
  postApproval?: boolean
  allowMemberInvites?: boolean
  showMemberDirectory?: boolean
  welcomePostEnabled?: boolean
  bannerUrl?: string
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
  avatarUrl?: string
  bannerUrl?: string
  avatarFile?: File
  bannerFile?: File
}

export interface CommunityPageSettingsDraft {
  name: string
  slug: string
  summary: string
  website: string
  locationLabel: string
  location: LocationSelection
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
  mapPinRequested?: boolean
  mapPinStatus?: CommunityPageMapPinStatus
  avatarUrl?: string
  bannerUrl?: string
  avatarFile?: File
  bannerFile?: File
}
