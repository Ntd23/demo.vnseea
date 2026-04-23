import { useStorage } from "@vueuse/core"
import { ref, watch, onMounted } from "vue"

/**
 * Composable for managing filter state that persists in localStorage.
 * SSR-safe: will use initialValue on server and hydrate from storage on client.
 * 
 * @param key LocalStorage key
 * @param initialValue Default filter values
 */
export function usePersistedFilters<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  // Use a standard ref for SSR stability
  const filters = ref<T>({ ...initialValue })

  // Only initialize storage on client side to avoid hydration mismatch
  onMounted(() => {
    const storage = useStorage<T>(key, initialValue)
    
    // Sync ref with storage
    filters.value = { ...storage.value }

    // Keep them in sync
    watch(filters, (newVal) => {
      storage.value = newVal
    }, { deep: true })

    watch(storage, (newVal) => {
      filters.value = { ...newVal }
    }, { deep: true })
  })

  const resetFilters = () => {
    filters.value = { ...initialValue }
  }

  return {
    filters,
    resetFilters,
  }
}
