<template>
  <form class="relative w-full group" @submit.prevent="submitSearch">
    <UInput
      v-model="search"
      size="xl"
      :placeholder="$t('navigation.headerSearchInput.placeholder')"
      type="search"
      icon="i-ph-magnifying-glass-duotone"
      :ui="{
        wrapper: 'relative',
        base: 'h-12 w-full pl-12 pr-12 rounded-2xl border-none ring-1 ring-secondary-100 bg-secondary-50/50 text-[var(--text-primary)] transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:bg-white focus:shadow-lg focus:shadow-primary-500/10 placeholder:text-secondary-400 font-medium',
        icon: {
          leading: {
            wrapper: 'absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none',
            pointer: 'pointer-events-none',
            base: 'text-[var(--icon-primary)] h-5.5 w-5.5 transition-colors group-focus-within:text-[var(--icon-primary)]'
          }
        }
      }"
    >
      <template #trailing>
        <div class="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white ring-1 ring-secondary-100 shadow-sm opacity-60 group-focus-within:opacity-100 transition-opacity">
          <kbd class="text-[10px] font-black font-sans text-[var(--text-primary)] uppercase tracking-widest">K</kbd>
        </div>
      </template>
    </UInput>
  </form>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()
const router = useRouter()
const search = ref(readQueryValue(route.query.q))

// Sync search input with route query
watch(
  () => route.query.q,
  (value) => {
    const nextValue = readQueryValue(value)
    if (nextValue !== search.value) search.value = nextValue
  },
)

// Automatic search update with debounce (only when already on search page)
watchDebounced(
  search,
  (newValue) => {
    if (route.path === "/search") {
      const keyword = newValue.trim()
      const nextQuery = keyword ? { q: keyword } : {}
      
      // Update query without pushing new history entry for every keystroke
      void router.replace({ path: "/search", query: nextQuery })
    }
  },
  { debounce: 500, maxWait: 1000 },
)

function submitSearch() {
  const keyword = search.value.trim()
  const nextQuery = keyword ? { q: keyword } : {}
  void router.push({ path: "/search", query: nextQuery })
}
</script>
