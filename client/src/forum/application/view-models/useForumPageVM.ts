// English description: Forum page view-model that owns search query, backend loading, and pagination.

import { ApiForumRepository } from "../../infrastructure/repositories/ApiForumRepository"

const readQueryValue = (value: unknown) => Array.isArray(value) ? String(value[0] || "") : String(value || "")

export function useForumPageVM() {
  const route = useRoute()
  const router = useRouter()
  const repository = new ApiForumRepository()
  const search = ref(readQueryValue(route.query.q))

  const { data, pending, error } = useAsyncData(
    () => `forum:${readQueryValue(route.query.q)}`,
    () => repository.getCatalog({ q: readQueryValue(route.query.q) }),
    { watch: [() => route.query.q] },
  )

  const sections = computed(() => data.value?.sections ?? [])
  const canCreate = computed(() => Boolean(data.value?.canCreate))
  const hasMore = computed(() => Boolean(data.value?.hasMore))
  const loadingMore = ref(false)

  const syncQuery = async () => {
    await router.push({
      path: "/forum",
      query: search.value.trim() ? { q: search.value.trim() } : {},
    })
  }

  const loadMore = async () => {
    if (!data.value?.nextOffset || loadingMore.value) return
    loadingMore.value = true

    try {
      const next = await repository.getCatalog({
        q: readQueryValue(route.query.q),
        offset: data.value.nextOffset,
      })
      data.value = {
        ...next,
        sections: [...sections.value, ...next.sections],
      }
    }
    finally {
      loadingMore.value = false
    }
  }

  return {
    search,
    sections,
    canCreate,
    hasMore,
    pending,
    error,
    loadingMore,
    syncQuery,
    loadMore,
  }
}
