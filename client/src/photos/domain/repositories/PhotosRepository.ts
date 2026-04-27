import type { ComputedRef } from "vue"
import type { PhotoAlbum, PhotoCategory, PhotoItem, PhotoQuickLink } from "../types/photos.types"

export interface PhotosRepository {
  albums: ComputedRef<PhotoAlbum[]>
  categories: ComputedRef<PhotoCategory[]>
  photos: ComputedRef<PhotoItem[]>
  quickLinks: ComputedRef<PhotoQuickLink[]>
}
