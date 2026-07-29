// English description: Manages page-like invite candidates with per-user submission state and localized feedback.

import { computed, ref } from "vue"
import type { UserRecord } from "../../../shared-kernel/domain/types/user.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

export function useCommunityPageInviteVM(
  pageSlug: () => string,
  repository = createApiCommunityRepository(),
) {
  const { t } = useI18n()
  const toast = useToast()

  const isOpen = ref(false)
  const isPending = ref(false)
  const searchQuery = ref("")
  const candidates = ref<UserRecord[]>([])
  const invitedIds = ref<Set<number>>(new Set())
  const sendingIds = ref<Set<number>>(new Set())

  const visibleCandidates = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return candidates.value

    return candidates.value.filter(user =>
      user.name.toLowerCase().includes(query)
      || user.username.toLowerCase().includes(query),
    )
  })

  async function openModal() {
    isOpen.value = true
    await fetchCandidates()
  }

  function closeModal() {
    isOpen.value = false
    searchQuery.value = ""
  }

  async function fetchCandidates() {
    if (isPending.value) return

    isPending.value = true
    try {
      candidates.value = await repository.getPageInvites(pageSlug())
      invitedIds.value = new Set()
    }
    catch {
      toast.add({
        title: t("pages.pageDetailPage.invites.loadErrorTitle"),
        description: t("pages.pageDetailPage.invites.loadError"),
        color: "error",
        icon: "i-ph-warning-circle-fill",
      })
    }
    finally {
      isPending.value = false
    }
  }

  async function sendInvite(userId: number) {
    if (invitedIds.value.has(userId) || sendingIds.value.has(userId)) return

    const candidate = candidates.value.find(user => user.id === userId)
    sendingIds.value = new Set([...sendingIds.value, userId])

    try {
      await repository.sendPageInvite(pageSlug(), userId)
      invitedIds.value = new Set([...invitedIds.value, userId])
      toast.add({
        title: t("pages.pageDetailPage.invites.inviteSuccessTitle"),
        description: t("pages.pageDetailPage.invites.inviteSuccessDescription", {
          user: candidate?.name || candidate?.username || t("pages.pageDetailPage.invites.friendFallback"),
        }),
        color: "success",
        icon: "i-ph-check-circle-fill",
      })
    }
    catch {
      toast.add({
        title: t("pages.pageDetailPage.invites.inviteErrorTitle"),
        description: t("pages.pageDetailPage.invites.inviteError"),
        color: "error",
        icon: "i-ph-warning-circle-fill",
      })
    }
    finally {
      sendingIds.value = new Set([...sendingIds.value].filter(id => id !== userId))
    }
  }

  return {
    isOpen,
    isPending,
    searchQuery,
    visibleCandidates,
    invitedIds,
    sendingIds,
    openModal,
    closeModal,
    sendInvite,
  }
}
