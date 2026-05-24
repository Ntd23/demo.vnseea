// English description: Coordinates inbox state, realtime message refresh, one-to-one typing, and group member management for the messages page.

import { onBeforeUnmount, onMounted, watch } from "vue"
import { useMessagesInbox } from "../composables/useMessagesInbox"
import { useMessageRealtime } from "../composables/useMessageRealtime"
import { createApiMessagesRepository } from "../../infrastructure/repositories/ApiMessagesRepository"
import type {
  MessageComposerDraft,
  MessageGroupCandidate,
  MessageGroupCreateCandidate,
} from "../../domain/types/messages.types"

export function useMessagesPageVM() {
  const { t } = useI18n()
  const toast = useToast()
  const repository = createApiMessagesRepository()
  const inbox = useMessagesInbox(repository)
  const realtime = useMessageRealtime({
    repository,
    activeTab: inbox.activeTab,
    selectedContact: inbox.selectedContact,
    refreshInbox: async () => await inbox.refreshInbox(),
    refreshThread: async () => await inbox.refreshThread(),
    setRemoteTyping: inbox.setRemoteTyping,
    setContactTyping: inbox.setContactTyping,
  })
  const groupCandidateQuery = ref("")
  const debouncedGroupCandidateQuery = ref("")
  const isUpdatingGroupMembers = ref(false)
  const createGroupModalOpen = ref(false)
  const createGroupName = ref("")
  const createGroupQuery = ref("")
  const createGroupCandidatesRaw = ref<MessageGroupCreateCandidate[]>([])
  const createGroupSelectedCandidates = ref<MessageGroupCreateCandidate[]>([])
  const createGroupAvatarFile = ref<File | null>(null)
  const createGroupAvatarPreviewUrl = ref("")
  const createGroupErrorMessage = ref("")
  const isCreatingGroup = ref(false)
  const createGroupCandidatesPending = ref(false)
  const selectedCreateGroupUserIds = computed(() =>
    new Set(createGroupSelectedCandidates.value.map(candidate => candidate.userId)),
  )
  const createGroupCandidates = computed(() =>
    createGroupCandidatesRaw.value.filter(candidate => !selectedCreateGroupUserIds.value.has(candidate.userId)),
  )
  let createGroupSearchToken = 0

  const selectedGroupId = computed(() => {
    const contact = inbox.selectedContact.value

    if (inbox.activeTab.value !== "group" || contact?.type !== "group") {
      return 0
    }

    return contact.groupId ?? 0
  })

  const {
    data: groupDetails,
    status: groupDetailsStatus,
    refresh: refreshGroupDetails,
  } = useAsyncData(
    () => selectedGroupId.value > 0
      ? `messages:group-details:${selectedGroupId.value}`
      : "messages:group-details:none",
    () => selectedGroupId.value > 0
      ? repository.getGroupDetails(selectedGroupId.value)
      : Promise.resolve(null),
    {
      watch: [selectedGroupId],
      default: () => null,
    },
  )

  const selectedGroupCanManage = computed(() =>
    groupDetails.value?.groupId === selectedGroupId.value
    && Boolean(groupDetails.value?.canManage),
  )

  const {
    data: groupCandidates,
    status: groupCandidatesStatus,
    refresh: refreshGroupCandidates,
  } = useAsyncData<MessageGroupCandidate[]>(
    () => selectedGroupId.value > 0 && selectedGroupCanManage.value
      ? `messages:group-candidates:${selectedGroupId.value}:${debouncedGroupCandidateQuery.value}`
      : "messages:group-candidates:none",
    () => selectedGroupId.value > 0 && selectedGroupCanManage.value
      ? repository.searchGroupCandidates(selectedGroupId.value, debouncedGroupCandidateQuery.value)
      : Promise.resolve([]),
    {
      watch: [selectedGroupId, debouncedGroupCandidateQuery, selectedGroupCanManage],
      default: () => [],
    },
  )

  const syncActiveTypingState = async () => {
    const contact = inbox.selectedContact.value

    if (inbox.activeTab.value !== "user" || contact?.type !== "user" || !contact.userId) {
      inbox.clearRemoteTyping()
      return
    }

    await realtime.syncTypingState(contact.userId)
  }

  const stopComposerTyping = async () => {
    const contact = inbox.selectedContact.value

    if (inbox.activeTab.value !== "user" || contact?.type !== "user" || !contact.userId) {
      return
    }

    await realtime.stopTyping(contact.userId)
  }

  const startComposerTyping = async () => {
    const contact = inbox.selectedContact.value

    if (inbox.activeTab.value !== "user" || contact?.type !== "user" || !contact.userId) {
      return
    }

    await realtime.startTyping(contact.userId)
  }

  const sendMessage = async (input: MessageComposerDraft) => {
    await inbox.sendMessage(input)
    await stopComposerTyping()
  }

  const resolveErrorMessage = (error: unknown, fallback: string) => {
    if (!error || typeof error !== "object") {
      return fallback
    }

    const normalized = error as {
      data?: {
        statusMessage?: string
        message?: string
      }
      statusMessage?: string
      message?: string
    }

    return normalized.data?.statusMessage
      || normalized.statusMessage
      || normalized.data?.message
      || normalized.message
      || fallback
  }

  const revokeCreateGroupAvatarPreview = () => {
    if (createGroupAvatarPreviewUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(createGroupAvatarPreviewUrl.value)
    }

    createGroupAvatarPreviewUrl.value = ""
  }

  const resetCreateGroupModal = () => {
    createGroupSearchToken += 1
    createGroupName.value = ""
    createGroupQuery.value = ""
    createGroupCandidatesRaw.value = []
    createGroupSelectedCandidates.value = []
    createGroupCandidatesPending.value = false
    createGroupErrorMessage.value = ""
    createGroupAvatarFile.value = null
    revokeCreateGroupAvatarPreview()
  }

  const closeCreateGroupModal = () => {
    createGroupModalOpen.value = false
    resetCreateGroupModal()
  }

  const openCreateGroupModal = () => {
    createGroupErrorMessage.value = ""
    createGroupModalOpen.value = true
  }

  const setCreateGroupAvatar = (file: File | null) => {
    createGroupAvatarFile.value = file
    revokeCreateGroupAvatarPreview()

    if (file) {
      createGroupAvatarPreviewUrl.value = URL.createObjectURL(file)
    }
  }

  const addCreateGroupParticipant = (candidate: MessageGroupCreateCandidate) => {
    if (selectedCreateGroupUserIds.value.has(candidate.userId)) {
      return
    }

    createGroupSelectedCandidates.value = [
      ...createGroupSelectedCandidates.value,
      candidate,
    ]
  }

  const removeCreateGroupParticipant = (userId: number) => {
    createGroupSelectedCandidates.value = createGroupSelectedCandidates.value.filter(
      candidate => candidate.userId !== userId,
    )
  }

  const submitCreateGroup = async () => {
    if (isCreatingGroup.value) {
      return false
    }

    isCreatingGroup.value = true
    createGroupErrorMessage.value = ""

    try {
      const result = await repository.createGroup({
        name: createGroupName.value,
        recipientIds: createGroupSelectedCandidates.value.map(candidate => candidate.userId),
        avatar: createGroupAvatarFile.value,
      })

      inbox.activeTab.value = "group"
      inbox.query.value = ""
      await inbox.refreshInbox()
      await nextTick()

      if (result.groupId) {
        const createdGroup = inbox.filteredContacts.value.find(contact =>
          contact.type === "group" && contact.groupId === result.groupId,
        )

        if (createdGroup) {
          await inbox.selectContact(createdGroup)
        }
      }

      closeCreateGroupModal()

      toast.add({
        title: t("pages.messagesPage.groupCreateSuccessTitle"),
        description: t("pages.messagesPage.groupCreateSuccessDescription"),
        color: "success",
      })

      return true
    }
    catch (error) {
      createGroupErrorMessage.value = resolveErrorMessage(
        error,
        t("pages.messagesPage.groupCreateErrorDescription"),
      )
      return false
    }
    finally {
      isCreatingGroup.value = false
    }
  }

  const refreshActiveGroupState = async () => {
    if (selectedGroupId.value <= 0) {
      return
    }

    await refreshGroupDetails()

    if (selectedGroupCanManage.value) {
      await refreshGroupCandidates()
    }

    await inbox.refreshInbox()
  }

  const addGroupMember = async (userId: number) => {
    if (selectedGroupId.value <= 0 || userId <= 0 || isUpdatingGroupMembers.value) {
      return false
    }

    isUpdatingGroupMembers.value = true

    try {
      await repository.addGroupMembers(selectedGroupId.value, [userId])
      await refreshActiveGroupState()
      toast.add({
        title: t("pages.messagesPage.groupInviteSuccessTitle"),
        description: t("pages.messagesPage.groupInviteSuccessDescription"),
        color: "success",
      })
      return true
    }
    catch {
      toast.add({
        title: t("pages.messagesPage.groupInviteErrorTitle"),
        description: t("pages.messagesPage.groupInviteErrorDescription"),
        color: "error",
      })
      return false
    }
    finally {
      isUpdatingGroupMembers.value = false
    }
  }

  const removeGroupMember = async (userId: number) => {
    if (selectedGroupId.value <= 0 || userId <= 0 || isUpdatingGroupMembers.value) {
      return false
    }

    isUpdatingGroupMembers.value = true

    try {
      await repository.removeGroupMember(selectedGroupId.value, userId)
      await refreshActiveGroupState()
      toast.add({
        title: t("pages.messagesPage.groupKickSuccessTitle"),
        description: t("pages.messagesPage.groupKickSuccessDescription"),
        color: "success",
      })
      return true
    }
    catch {
      toast.add({
        title: t("pages.messagesPage.groupKickErrorTitle"),
        description: t("pages.messagesPage.groupKickErrorDescription"),
        color: "error",
      })
      return false
    }
    finally {
      isUpdatingGroupMembers.value = false
    }
  }

  watchDebounced(
    groupCandidateQuery,
    (value: string) => {
      debouncedGroupCandidateQuery.value = value.trim()
    },
    { debounce: 250, maxWait: 500 },
  )

  watchDebounced(
    createGroupQuery,
    async (value: string) => {
      const keyword = value.trim()
      const requestToken = ++createGroupSearchToken

      if (!createGroupModalOpen.value || !keyword) {
        createGroupCandidatesRaw.value = []
        createGroupCandidatesPending.value = false
        return
      }

      createGroupCandidatesPending.value = true

      try {
        const candidates = await repository.searchCreateGroupParticipants(keyword)

        if (requestToken === createGroupSearchToken) {
          createGroupCandidatesRaw.value = candidates
        }
      }
      catch {
        if (requestToken === createGroupSearchToken) {
          createGroupCandidatesRaw.value = []
        }
      }
      finally {
        if (requestToken === createGroupSearchToken) {
          createGroupCandidatesPending.value = false
        }
      }
    },
    { debounce: 250, maxWait: 500 },
  )

  watch(
    () => [inbox.activeTab.value, inbox.selectedContact.value?.type || "", inbox.selectedContact.value?.userId || 0] as const,
    async ([, nextType], [, prevType, prevUserId]) => {
      if (prevType === "user" && prevUserId > 0) {
        await realtime.stopTyping(prevUserId)
      }

      if (nextType !== "user") {
        inbox.clearRemoteTyping()
        return
      }

      await syncActiveTypingState()
    },
  )

  watch(selectedGroupId, () => {
    groupCandidateQuery.value = ""
    debouncedGroupCandidateQuery.value = ""
  }, { immediate: true })

  onMounted(() => {
    void realtime.start()
    void syncActiveTypingState()
  })

  onBeforeUnmount(() => {
    revokeCreateGroupAvatarPreview()
    void realtime.stop()
  })

  return {
    ...inbox,
    addCreateGroupParticipant,
    addGroupMember,
    closeCreateGroupModal,
    createGroupAvatarFile,
    createGroupAvatarPreviewUrl,
    createGroupCandidates,
    createGroupCandidatesPending,
    createGroupErrorMessage,
    createGroupModalOpen,
    createGroupName,
    createGroupQuery,
    createGroupSelectedCandidates,
    groupCandidateQuery,
    groupCandidates,
    groupCandidatesPending: computed(() => groupCandidatesStatus.value === "pending"),
    groupDetails,
    groupDetailsPending: computed(() => groupDetailsStatus.value === "pending"),
    isCreatingGroup,
    isUpdatingGroupMembers,
    openCreateGroupModal,
    removeGroupMember,
    removeCreateGroupParticipant,
    sendMessage,
    setCreateGroupAvatar,
    startComposerTyping,
    stopComposerTyping,
    submitCreateGroup,
    realtimeConnected: realtime.connected,
    pollingFallbackActive: realtime.pollingFallbackActive,
    isContactTyping: inbox.isContactTyping,
  }
}
