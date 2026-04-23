import { ref, watch } from "vue"
import { refDebounced } from "@vueuse/core"
import { useRoute, useRouter } from "#app"

interface SearchOptions {
  debounceMs?: number
  syncUrl?: boolean
  queryParamName?: string
}

/**
 * Composable for handling debounced search inputs with optional URL synchronization.
 * 
 * @param options Configuration for debounce timing and URL syncing.
 */
export const useDebouncedSearch = (options: SearchOptions = {}) => {
  const {
    debounceMs = 500,
    syncUrl = true,
    queryParamName = "q"
  } = options

  const route = useRoute()
  const router = useRouter()

  // Initialize from URL if sync enabled
  const initialValue = syncUrl ? (route.query[queryParamName] as string || "") : ""
  
  const searchQuery = ref(initialValue)
  const debouncedSearchQuery = refDebounced(searchQuery, debounceMs)

  // Sync with URL when debounced value changes
  if (syncUrl) {
    watch(debouncedSearchQuery, (newValue) => {
      const currentQuery = { ...route.query }
      
      if (newValue) {
        currentQuery[queryParamName] = newValue
      } else {
        delete currentQuery[queryParamName]
      }

      router.push({
        query: currentQuery,
        // Using replace to avoid polluting browser history with every keystroke
        replace: true 
      })
    })

    // Listen for external URL changes (e.g. back button)
    watch(() => route.query[queryParamName], (newVal) => {
      const val = (newVal as string) || ""
      if (val !== searchQuery.value) {
        searchQuery.value = val
      }
    })
  }

  return {
    searchQuery,
    debouncedSearchQuery,
  }
}
