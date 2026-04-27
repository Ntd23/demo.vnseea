import type { ComputedRef } from "vue"
import { useMockSavedPostsData } from "../../../../app/composables/useMockSavedPostsData"
import type { SavedPostEntry } from "../../domain/types/saved.types"

export function useSavedPostsDataSource() {
  const data = useMockSavedPostsData()

  return {
    savedPosts: data.savedPosts as ComputedRef<SavedPostEntry[]>,
  }
}
