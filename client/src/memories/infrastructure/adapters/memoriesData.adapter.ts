import type { ComputedRef } from "vue"
import { useMockMemoriesData } from "../../../../app/composables/useMockMemoriesData"
import type { MemoryEntry } from "../../domain/types/memories.types"

export function useMemoriesDataSource() {
  const data = useMockMemoriesData()

  return {
    memoryEntries: data.memoryEntries as ComputedRef<MemoryEntry[]>,
  }
}
