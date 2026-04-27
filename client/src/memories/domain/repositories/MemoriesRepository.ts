import type { ComputedRef } from "vue"
import type { MemoryEntry } from "../types/memories.types"

export interface MemoriesRepository {
  memoryEntries: ComputedRef<MemoryEntry[]>
}
