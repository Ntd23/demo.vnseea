// English description: Profile context types returned from the backend-backed profile repository.

export type ProfileTabKey = "timeline" | "about" | "friends" | "photos" | "videos" | "albums"

export interface ProfileConnection {
  id: number
  name: string
  username: string
  initials: string
  meta: string
}

export interface ProfileApiResponse {
  id: number
  username: string
  displayName: string
  headline: string
  bio: string
  coverImage: string
  avatarUrl?: string
  avatarText: string
  verified: boolean
  isOwner: boolean
  statusText: string
  website?: string
  working?: string
  school?: string
  address?: string
  email?: string
  phone?: string
  gender?: string
  birthday?: string
  relationship?: string
  followersCount: number
  followingCount: number
  likedPagesCount: number
  joinedGroupsCount: number
  followers: ProfileConnection[]
  following: ProfileConnection[]
}

