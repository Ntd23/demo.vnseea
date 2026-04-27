export interface ProfileStats {
  posts: number
  friends: number
  photos: number
}

export interface ProfileUser {
  id: string
  fullName: string
  username: string
  avatar: string
  cover: string
  bio: string
  stats: ProfileStats
}

export interface MutualFriend {
  initials: string
  name: string
  meta: string
}
