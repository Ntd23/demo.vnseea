import { computed } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

export type PhotoCategoryKey =
  | "all"
  | "community"
  | "events"
  | "portraits"
  | "product"
  | "education"

export type PhotoCategory = {
  label: string
  value: PhotoCategoryKey
  icon: string
}

export type MockPhoto = {
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

export type PhotoAlbum = {
  title: string
  description: string
  cover: string
  count: number
  badge: string
  to: string
  accent: string
}

export type PhotoQuickLink = {
  title: string
  description: string
  to: string
  icon: string
  accent: string
}

export const useMockPhotosData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T
  const localizedList = <T>(key: string) =>
    computed(() => {
      const value = localized<ReadonlyArray<T> | null | undefined>(key)
      return Array.isArray(value) ? [...value] : []
    })

  const categories = localizedList<PhotoCategory>("pages.photosPage.categories")
  const photos = localizedList<MockPhoto>("pages.photosPage.photos")
  const albums = localizedList<PhotoAlbum>("pages.photosPage.albums")
  const quickLinks = localizedList<PhotoQuickLink>("pages.photosPage.quickLinks")

  return {
    categories,
    photos,
    albums,
    quickLinks,
  }
}

export const getPhotoEngagement = (
  photo: Pick<MockPhoto, "likes" | "comments">,
) => photo.likes + photo.comments * 2

export const formatPhotoNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
