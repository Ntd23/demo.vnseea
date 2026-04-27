import type { ComputedRef } from "vue"
import { useMockPhotosData } from "../../../../app/composables/useMockPhotosData"
import type { PhotoAlbum, PhotoCategory, PhotoItem, PhotoQuickLink } from "../../domain/types/photos.types"

export function usePhotosDataSource() {
  const data = useMockPhotosData()

  return {
    albums: data.albums as ComputedRef<PhotoAlbum[]>,
    categories: data.categories as ComputedRef<PhotoCategory[]>,
    photos: data.photos as ComputedRef<PhotoItem[]>,
    quickLinks: data.quickLinks as ComputedRef<PhotoQuickLink[]>,
  }
}
