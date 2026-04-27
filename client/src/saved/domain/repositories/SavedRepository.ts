import type { ComputedRef } from "vue"
import type { SavedPostEntry } from "../types/saved.types"

export interface SavedRepository {
  savedPosts: ComputedRef<SavedPostEntry[]>
}
