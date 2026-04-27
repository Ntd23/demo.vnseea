export type PhotoCategoryKey =
  | "all"
  | "community"
  | "events"
  | "portraits"
  | "product"
  | "education"

export interface PhotoCategory {
  label: string
  value: PhotoCategoryKey
  icon: string
}

export interface PhotoItem {
  id: string
  title: string
  category: Exclude<PhotoCategoryKey, "all">
  albumTitle: string
  photographer: string
  photographerRole: string
  location: string
  timeLabel: string
  likes: number
  comments: number
  image: string
  accent: string
  tags: string[]
  frame: "portrait" | "landscape" | "square" | "tall"
  companionTo: string
}

export interface PhotoAlbum {
  title: string
  description: string
  cover: string
  count: number
  badge: string
  to: string
  accent: string
}

export interface PhotoQuickLink {
  title: string
  description: string
  to: string
  icon: string
  accent: string
}

export interface PhotoLightboxItem {
  type: "image"
  src: string
  alt: string
}
