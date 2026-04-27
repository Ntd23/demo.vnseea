import type { ComputedRef } from "vue"
import { useMockWatchData } from "../../../../app/composables/useMockWatchData"
import type { WatchCategoryOption, WatchVideo } from "../../domain/types/watch.types"

export function useWatchDataSource() {
  const data = useMockWatchData()

  return {
    categories: data.categories as ComputedRef<WatchCategoryOption[]>,
    videos: data.videos as ComputedRef<WatchVideo[]>,
  }
}
