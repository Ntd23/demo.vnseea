// English description: Loads memories data and exposes sharing actions plus screen state for the memories route.

import type { FeedMemoryFriendRecord, FeedMemoryRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

export function useMemoriesPageVM(
  repository = createApiFeedRepository(),
) {
  const route = useRoute()
  const requestURL = useRequestURL()
  const toast = useToast()
  const { t } = useI18n()

  const loading = ref(true)
  const errorMessage = ref("")
  const memoryEntries = ref<FeedMemoryRecord[]>([])
  const memoryFriends = ref<FeedMemoryFriendRecord[]>([])

  async function fetchMemories() {
    loading.value = true
    errorMessage.value = ""

    try {
      const response = await repository.getMemories()
      memoryEntries.value = response.posts
      memoryFriends.value = response.friends
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.memoriesPage.emptyDescription")
    }
    finally {
      loading.value = false
    }
  }

  async function shareMemory(id: string) {
    const entry = memoryEntries.value.find(item => item.id === id)
    if (!entry) {
      return
    }

    const shareUrl = new URL(`${route.path}#memory-post-${entry.post.id}`, requestURL.origin).toString()

    try {
      if (!import.meta.client || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable")
      }

      await navigator.clipboard.writeText(shareUrl)
      toast.add({
        color: "success",
        icon: "i-ph-share-network-fill",
        title: entry.post.author,
        description: t("pages.memoriesPage.sharedAction"),
      })
    }
    catch {
      toast.add({
        color: "primary",
        icon: "i-ph-link-bold",
        title: entry.post.author,
        description: shareUrl,
      })
    }
  }

  return {
    loading,
    errorMessage,
    memoryEntries,
    memoryFriends,
    fetchMemories,
    shareMemory,
  }
}
