import { formatMemoryCount } from "../../domain/services/memories-format.service"
import { useMemoriesDataSource } from "../../infrastructure/adapters/memoriesData.adapter"

export function useMemoriesPage() {
  const { memoryEntries } = useMemoriesDataSource()
  const { t, locale } = useI18n()

  const sharedMemoryIds = ref<string[]>([])

  const sharedMemoryCount = computed(() => sharedMemoryIds.value.length)
  const formatCount = (value: number) => formatMemoryCount(value, locale.value)

  const summaryCards = computed(() => {
    const interactionCount = memoryEntries.value.reduce(
      (sum, item) => sum + item.post.stats.likes + item.post.stats.comments + item.post.stats.shares,
      0,
    )

    return [
      {
        label: t("pages.memoriesPage.statMemories"),
        value: formatCount(memoryEntries.value.length),
        description: t("pages.memoriesPage.statMemoriesDescription"),
      },
      {
        label: t("pages.memoriesPage.statYears"),
        value: formatCount(new Set(memoryEntries.value.map(item => item.yearOffset)).size),
        description: t("pages.memoriesPage.statYearsDescription"),
      },
      {
        label: t("pages.memoriesPage.statShared"),
        value: formatCount(sharedMemoryCount.value),
        description: t("pages.memoriesPage.statSharedDescription"),
      },
      {
        label: t("pages.memoriesPage.statInteractions"),
        value: formatCount(interactionCount),
        description: t("pages.memoriesPage.statInteractionsDescription"),
      },
    ]
  })

  const heroMainStat = computed(() => summaryCards.value[0])
  const heroSecondaryStats = computed(() => summaryCards.value.slice(1))

  function shareMemory(id: string) {
    if (sharedMemoryIds.value.includes(id)) return
    sharedMemoryIds.value = [...sharedMemoryIds.value, id]
  }

  function resetSharedMemories() {
    sharedMemoryIds.value = []
  }

  return {
    heroMainStat,
    heroSecondaryStats,
    memoryEntries,
    sharedMemoryCount,
    sharedMemoryIds,
    resetSharedMemories,
    shareMemory,
  }
}
