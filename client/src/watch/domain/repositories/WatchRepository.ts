import type { ComputedRef } from "vue"
import type { WatchCategoryOption, WatchVideo } from "../types/watch.types"

export interface WatchRepository {
  categories: ComputedRef<WatchCategoryOption[]>
  videos: ComputedRef<WatchVideo[]>
}
