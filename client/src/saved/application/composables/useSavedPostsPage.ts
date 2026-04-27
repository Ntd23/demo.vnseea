import { formatSavedCount } from "../../domain/services/saved-format.service"
import { useSavedPostsDataSource } from "../../infrastructure/adapters/savedPostsData.adapter"

export function useSavedPostsPage() {
  const { t, locale } = useI18n()
  const { savedPosts } = useSavedPostsDataSource()

  const removedIds = ref<string[]>([])

  const visibleSavedPosts = computed(() =>
    savedPosts.value.filter(item => !removedIds.value.includes(item.id)),
  )

  const formatCount = (value: number) => formatSavedCount(value, locale.value)

  const summaryStats = computed(() => {
    const authors = new Set(visibleSavedPosts.value.map(item => item.post.author))
    const collections = new Set(visibleSavedPosts.value.map(item => item.collectionLabel))
    const interactionCount = visibleSavedPosts.value.reduce(
      (sum, item) => sum + item.post.stats.likes + item.post.stats.comments + item.post.stats.shares,
      0,
    )

    return [
      {
        label: t("pages.savedPostsPage.statSaved"),
        value: formatCount(visibleSavedPosts.value.length),
        description: t("pages.savedPostsPage.statSavedDescription"),
      },
      {
        label: t("pages.savedPostsPage.statAuthors"),
        value: formatCount(authors.size),
        description: t("pages.savedPostsPage.statAuthorsDescription"),
      },
      {
        label: t("pages.savedPostsPage.statCollections"),
        value: formatCount(collections.size),
        description: t("pages.savedPostsPage.statCollectionsDescription"),
      },
      {
        label: t("pages.savedPostsPage.statInteractions"),
        value: formatCount(interactionCount),
        description: t("pages.savedPostsPage.statInteractionsDescription"),
      },
    ]
  })

  const heroMainStat = computed(() => summaryStats.value[0])
  const heroSecondaryStats = computed(() => summaryStats.value.slice(1))

  function removeSavedPost(id: string) {
    if (removedIds.value.includes(id)) return
    removedIds.value = [...removedIds.value, id]
  }

  function removeAll() {
    removedIds.value = savedPosts.value.map(item => item.id)
  }

  function restoreMockData() {
    removedIds.value = []
  }

  return {
    heroMainStat,
    heroSecondaryStats,
    visibleSavedPosts,
    removeAll,
    removeSavedPost,
    restoreMockData,
  }
}
