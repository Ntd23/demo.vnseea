// English description: Coordinates one-to-one notification preferences, message search, and shared-content loading for the conversation info panel.

import type { Ref } from "vue"
import type {
  MessageContact,
  MessageItem,
  MessageSharedContent,
} from "../../domain/types/messages.types"
import { createApiMessagesRepository } from "../../infrastructure/repositories/ApiMessagesRepository"

const emptySharedContent = (): MessageSharedContent => ({
  media: [],
  files: [],
  links: [],
})

export function useUserConversationInfo(contact: Ref<MessageContact | null | undefined>) {
  const { t } = useI18n()
  const toast = useToast()
  const repository = createApiMessagesRepository()
  const notificationsMuted = ref(false)
  const notificationsPending = ref(false)
  const searchQuery = ref("")
  const searchResults = ref<MessageItem[]>([])
  const searchPending = ref(false)
  const searchFailed = ref(false)
  const sharedContent = ref<MessageSharedContent>(emptySharedContent())
  const sharedContentPending = ref(false)
  const sharedContentFailed = ref(false)
  let searchRequestToken = 0
  let contentRequestToken = 0

  const loadSharedContent = async () => {
    const activeContact = contact.value
    const requestToken = ++contentRequestToken

    if (activeContact?.type !== "user" || !activeContact.userId) {
      sharedContent.value = emptySharedContent()
      sharedContentPending.value = false
      sharedContentFailed.value = false
      return
    }

    sharedContentPending.value = true
    sharedContentFailed.value = false

    try {
      const content = await repository.getSharedContent(activeContact)
      if (requestToken === contentRequestToken) {
        sharedContent.value = content
      }
    }
    catch {
      if (requestToken === contentRequestToken) {
        sharedContent.value = emptySharedContent()
        sharedContentFailed.value = true
      }
    }
    finally {
      if (requestToken === contentRequestToken) {
        sharedContentPending.value = false
      }
    }
  }

  const toggleNotifications = async () => {
    const activeContact = contact.value

    if (
      activeContact?.type !== "user"
      || !activeContact.chatId
      || notificationsPending.value
    ) {
      return false
    }

    const nextMuted = !notificationsMuted.value
    notificationsPending.value = true

    try {
      await repository.setConversationNotifications(activeContact, !nextMuted)
      notificationsMuted.value = nextMuted
      activeContact.notificationsMuted = nextMuted
      toast.add({
        title: nextMuted
          ? t("pages.messagesPage.notificationsMutedTitle")
          : t("pages.messagesPage.notificationsEnabledTitle"),
        description: nextMuted
          ? t("pages.messagesPage.notificationsMutedDescription")
          : t("pages.messagesPage.notificationsEnabledDescription"),
        color: "success",
      })
      return true
    }
    catch {
      toast.add({
        title: t("pages.messagesPage.notificationsErrorTitle"),
        description: t("pages.messagesPage.notificationsErrorDescription"),
        color: "error",
      })
      return false
    }
    finally {
      notificationsPending.value = false
    }
  }

  watchDebounced(
    searchQuery,
    async (value: string) => {
      const activeContact = contact.value
      const normalizedQuery = value.trim()
      const requestToken = ++searchRequestToken

      if (
        activeContact?.type !== "user"
        || !activeContact.userId
        || normalizedQuery.length < 2
      ) {
        searchResults.value = []
        searchPending.value = false
        searchFailed.value = false
        return
      }

      searchPending.value = true
      searchFailed.value = false

      try {
        const results = await repository.searchConversation(activeContact, normalizedQuery)
        if (requestToken === searchRequestToken) {
          searchResults.value = results
        }
      }
      catch {
        if (requestToken === searchRequestToken) {
          searchResults.value = []
          searchFailed.value = true
        }
      }
      finally {
        if (requestToken === searchRequestToken) {
          searchPending.value = false
        }
      }
    },
    { debounce: 300, maxWait: 600 },
  )

  watch(
    () => `${contact.value?.type || ""}:${contact.value?.userId || 0}:${contact.value?.chatId || 0}`,
    () => {
      searchRequestToken += 1
      notificationsMuted.value = Boolean(contact.value?.notificationsMuted)
      searchQuery.value = ""
      searchResults.value = []
      searchPending.value = false
      searchFailed.value = false
      void loadSharedContent()
    },
    { immediate: true },
  )

  return {
    loadSharedContent,
    notificationsMuted,
    notificationsPending,
    searchFailed,
    searchPending,
    searchQuery,
    searchResults,
    sharedContent,
    sharedContentFailed,
    sharedContentPending,
    toggleNotifications,
  }
}
