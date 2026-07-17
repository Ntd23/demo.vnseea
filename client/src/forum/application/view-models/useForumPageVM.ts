// English description: Forum page view-model for five backend-backed tabs, URL filters, pagination, and owner mutations.

import { createApiForumRepository } from "../../infrastructure/repositories/ApiForumRepository"
import type {
  ForumPageTab,
  ForumReplyPayload,
  ForumReplyUpdatePayload,
  ForumSearchScope,
  ForumThreadPayload,
  ForumThreadUpdatePayload,
} from "../../domain/types/forum.types"

const readQueryValue = (value: unknown) => Array.isArray(value) ? String(value[0] || "") : String(value || "")
const readQueryNumber = (value: unknown) => {
  const parsed = Number(readQueryValue(value))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const forumTabs = ["browse", "members", "search", "my_threads", "my_messages"] as const satisfies readonly ForumPageTab[]
const forumSearchScopes = ["forums", "threads", "messages"] as const satisfies readonly ForumSearchScope[]

const readForumTab = (value: unknown): ForumPageTab => {
  const raw = readQueryValue(value)
  return forumTabs.includes(raw as ForumPageTab) ? raw as ForumPageTab : "browse"
}

const readSearchScope = (value: unknown): ForumSearchScope => {
  const raw = readQueryValue(value)
  return forumSearchScopes.includes(raw as ForumSearchScope) ? raw as ForumSearchScope : "threads"
}

export function useForumPageVM(repository = createApiForumRepository()) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const browseSearch = ref(readQueryValue(route.query.q))
  const memberSearch = ref(readQueryValue(route.query.member))
  const advancedSearchTerm = ref(readQueryValue(route.query.q))
  const advancedSearchScope = ref<ForumSearchScope>(readSearchScope(route.query.scope))
  const advancedSearchContent = ref(readQueryValue(route.query.content) === "1")
  const advancedSearchSectionId = ref(readQueryNumber(route.query.section))
  const createOpen = ref(false)
  const creating = ref(false)
  const replying = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const loadingMore = ref(false)

  const activeTab = computed(() => readForumTab(route.query.tab))
  const activeForumId = computed(() => readQueryNumber(route.query.fid))
  const activeThreadId = computed(() => readQueryNumber(route.query.tid))
  const memberLetter = computed(() => readQueryValue(route.query.letter).toLowerCase().replace(/[^a-z]/g, "").slice(0, 1))
  const routeSearchScope = computed(() => readSearchScope(route.query.scope))
  const routeSearchContent = computed(() => readQueryValue(route.query.content) === "1")
  const routeSearchSectionId = computed(() => readQueryNumber(route.query.section))
  const isForumDrilldown = computed(() => activeTab.value === "browse" && activeForumId.value > 0)
  const isThreadDetail = computed(() => activeThreadId.value > 0)
  const shouldLoadForumThreads = computed(() => activeTab.value === "browse" && activeForumId.value > 0)
  const shouldLoadMyThreads = computed(() => activeTab.value === "my_threads")
  const shouldLoadMembers = computed(() => activeTab.value === "members")
  const shouldLoadMyMessages = computed(() => activeTab.value === "my_messages")
  const shouldSearch = computed(() => activeTab.value === "search" && readQueryValue(route.query.q).trim().length >= 4)

  const catalogState = useAsyncData(
    () => `forum:catalog:${activeTab.value === "browse" ? readQueryValue(route.query.q) : ""}`,
    () => repository.getCatalog({
      q: activeTab.value === "browse" ? readQueryValue(route.query.q) : "",
    }),
    { watch: [activeTab, () => route.query.q] },
  )

  const threadListState = useAsyncData(
    () => `forum:threads:${activeForumId.value}:${readQueryValue(route.query.q)}`,
    () => shouldLoadForumThreads.value
      ? repository.getThreads({ forumId: activeForumId.value, q: readQueryValue(route.query.q) })
      : Promise.resolve({ forum: null, threads: [], canCreate: false, hasMore: false, nextOffset: null }),
    { watch: [activeTab, activeForumId, () => route.query.q] },
  )

  const myThreadState = useAsyncData(
    () => `forum:my-threads:${readQueryValue(route.query.q)}`,
    () => shouldLoadMyThreads.value
      ? repository.getMyThreads({ q: readQueryValue(route.query.q) })
      : Promise.resolve({ forum: null, threads: [], canCreate: false, hasMore: false, nextOffset: null }),
    { watch: [activeTab, () => route.query.q] },
  )

  const memberState = useAsyncData(
    () => `forum:members:${readQueryValue(route.query.member)}:${memberLetter.value}`,
    () => shouldLoadMembers.value
      ? repository.getMembers({
          q: readQueryValue(route.query.member),
          letter: memberLetter.value,
        })
      : Promise.resolve({ members: [], hasMore: false, nextOffset: null }),
    { watch: [activeTab, () => route.query.member, memberLetter] },
  )

  const forumSearchState = useAsyncData(
    () => `forum:search:${readQueryValue(route.query.q)}:${routeSearchScope.value}:${routeSearchContent.value}:${routeSearchSectionId.value}`,
    () => shouldSearch.value
      ? repository.search({
          q: readQueryValue(route.query.q),
          scope: routeSearchScope.value,
          includeContent: routeSearchContent.value,
          sectionId: routeSearchSectionId.value,
        })
      : Promise.resolve({
          resultType: routeSearchScope.value,
          sections: [],
          threads: [],
          targetThreadId: null,
          targetForumId: null,
          hasMore: false,
          nextOffset: null,
        }),
    {
      watch: [
        activeTab,
        () => route.query.q,
        routeSearchScope,
        routeSearchContent,
        routeSearchSectionId,
      ],
    },
  )

  const myMessageState = useAsyncData(
    () => "forum:my-messages",
    () => shouldLoadMyMessages.value
      ? repository.getMyMessages({})
      : Promise.resolve({ messages: [], hasMore: false, nextOffset: null }),
    { watch: [activeTab] },
  )

  const detailState = useAsyncData(
    () => `forum:thread:${activeThreadId.value}`,
    () => activeThreadId.value
      ? repository.getThreadDetail(activeThreadId.value)
      : Promise.resolve({ thread: null, canCreate: false }),
    { watch: [activeThreadId] },
  )

  const sections = computed(() => catalogState.data.value?.sections ?? [])
  const forums = computed(() => sections.value.flatMap(section => section.forums))
  const activeForum = computed(() =>
    threadListState.data.value?.forum
    ?? forums.value.find(forum => forum.id === activeForumId.value)
    ?? null,
  )
  const forumThreads = computed(() => threadListState.data.value?.threads ?? [])
  const myThreads = computed(() => myThreadState.data.value?.threads ?? [])
  const members = computed(() => memberState.data.value?.members ?? [])
  const searchSections = computed(() => forumSearchState.data.value?.sections ?? [])
  const searchThreads = computed(() => forumSearchState.data.value?.threads ?? [])
  const searchResultType = computed(() => forumSearchState.data.value?.resultType ?? routeSearchScope.value)
  const myMessages = computed(() => myMessageState.data.value?.messages ?? [])
  const threads = computed(() => activeTab.value === "my_threads" ? myThreads.value : forumThreads.value)
  const selectedThread = computed(() =>
    detailState.data.value?.thread
    ?? threads.value.find(thread => thread.id === activeThreadId.value)
    ?? searchThreads.value.find(thread => thread.id === activeThreadId.value)
    ?? null,
  )
  const canCreate = computed(() =>
    Boolean(
      catalogState.data.value?.canCreate
      || threadListState.data.value?.canCreate
      || myThreadState.data.value?.canCreate
      || detailState.data.value?.canCreate,
    ),
  )
  const hasMoreThreads = computed(() =>
    Boolean(activeTab.value === "my_threads" ? myThreadState.data.value?.hasMore : threadListState.data.value?.hasMore),
  )
  const hasMoreMembers = computed(() => Boolean(memberState.data.value?.hasMore))
  const hasMoreMessages = computed(() => Boolean(myMessageState.data.value?.hasMore))
  const hasMoreSearchResults = computed(() => Boolean(forumSearchState.data.value?.hasMore))
  const pending = computed(() =>
    Boolean(
      catalogState.pending.value
      || threadListState.pending.value
      || myThreadState.pending.value
      || memberState.pending.value
      || forumSearchState.pending.value
      || myMessageState.pending.value
      || detailState.pending.value,
    ),
  )
  const tabPending = computed(() => {
    if (activeTab.value === "members") return memberState.pending.value
    if (activeTab.value === "search") return forumSearchState.pending.value || detailState.pending.value
    if (activeTab.value === "my_threads") return myThreadState.pending.value || detailState.pending.value
    if (activeTab.value === "my_messages") return myMessageState.pending.value || detailState.pending.value
    return catalogState.pending.value || threadListState.pending.value || detailState.pending.value
  })
  const error = computed(() =>
    catalogState.error.value
    || threadListState.error.value
    || myThreadState.error.value
    || memberState.error.value
    || forumSearchState.error.value
    || myMessageState.error.value
    || detailState.error.value,
  )
  const totalForumCount = computed(() => forums.value.length)
  const totalThreadCount = computed(() => forums.value.reduce((total, forum) => total + forum.posts, 0))

  watch(
    () => route.query,
    () => {
      if (activeTab.value === "browse") {
        browseSearch.value = readQueryValue(route.query.q)
      }

      memberSearch.value = readQueryValue(route.query.member)
      advancedSearchTerm.value = readQueryValue(route.query.q)
      advancedSearchScope.value = routeSearchScope.value
      advancedSearchContent.value = routeSearchContent.value
      advancedSearchSectionId.value = routeSearchSectionId.value
    },
    { deep: true },
  )

  watch(
    () => forumSearchState.data.value?.targetThreadId,
    async (threadId) => {
      if (
        activeTab.value !== "search"
        || routeSearchScope.value !== "messages"
        || !threadId
        || activeThreadId.value === threadId
      ) {
        return
      }

      await selectThread(threadId, forumSearchState.data.value?.targetForumId || 0, { replace: true })
    },
  )

  const selectTab = async (tab: ForumPageTab) => {
    await router.push({ path: "/forum", query: { tab } })
  }

  const syncBrowseQuery = async () => {
    await router.push({
      path: "/forum",
      query: {
        tab: "browse",
        ...(activeForumId.value ? { fid: String(activeForumId.value) } : {}),
        ...(browseSearch.value.trim() ? { q: browseSearch.value.trim() } : {}),
      },
    })
  }

  const syncMemberQuery = async () => {
    await router.push({
      path: "/forum",
      query: {
        tab: "members",
        ...(memberLetter.value ? { letter: memberLetter.value } : {}),
        ...(memberSearch.value.trim() ? { member: memberSearch.value.trim() } : {}),
      },
    })
  }

  const selectMemberLetter = async (letter: string) => {
    await router.push({
      path: "/forum",
      query: {
        tab: "members",
        ...(letter ? { letter } : {}),
        ...(memberSearch.value.trim() ? { member: memberSearch.value.trim() } : {}),
      },
    })
  }

  const submitAdvancedSearch = async () => {
    const terms = advancedSearchTerm.value.trim()
    if (terms.length < 4) {
      toast.add({
        color: "warning",
        icon: "i-ph-warning-circle-fill",
        title: t("pages.forumPage.searchValidationTitle"),
        description: t("pages.forumPage.searchValidationDescription"),
      })
      return
    }

    await router.push({
      path: "/forum",
      query: {
        tab: "search",
        q: terms,
        scope: advancedSearchScope.value,
        ...(advancedSearchContent.value ? { content: "1" } : {}),
        ...(advancedSearchSectionId.value ? { section: String(advancedSearchSectionId.value) } : {}),
      },
    })
  }

  const selectForum = async (forumId: number) => {
    await router.push({
      path: "/forum",
      query: {
        tab: "browse",
        fid: String(forumId),
        ...(activeTab.value === "browse" && browseSearch.value.trim() ? { q: browseSearch.value.trim() } : {}),
      },
    })
  }

  const currentSearchQuery = () => ({
    q: readQueryValue(route.query.q),
    scope: routeSearchScope.value,
    ...(routeSearchContent.value ? { content: "1" } : {}),
    ...(routeSearchSectionId.value ? { section: String(routeSearchSectionId.value) } : {}),
  })

  async function selectThread(threadId: number, forumId = 0, options: { replace?: boolean } = {}) {
    const tab = activeTab.value === "members" ? "browse" : activeTab.value
    const preservedQuery = tab === "search"
      ? currentSearchQuery()
      : tab === "browse" && browseSearch.value.trim()
        ? { q: browseSearch.value.trim() }
        : {}
    const navigation = {
      path: "/forum",
      query: {
        tab,
        ...(forumId || activeForumId.value ? { fid: String(forumId || activeForumId.value) } : {}),
        tid: String(threadId),
        ...preservedQuery,
      },
    }

    if (options.replace) {
      await router.replace(navigation)
      return
    }

    await router.push(navigation)
  }

  const resetFilters = async () => {
    if (activeTab.value === "members") {
      memberSearch.value = ""
    }
    else if (activeTab.value === "search") {
      advancedSearchTerm.value = ""
      advancedSearchScope.value = "threads"
      advancedSearchContent.value = false
      advancedSearchSectionId.value = 0
    }
    else {
      browseSearch.value = ""
    }

    await router.push({ path: "/forum", query: { tab: activeTab.value } })
  }

  const openCreate = () => {
    createOpen.value = true
  }

  const closeCreate = () => {
    createOpen.value = false
  }

  async function createThread(payload: ForumThreadPayload) {
    if (creating.value) return

    creating.value = true
    try {
      const result = await repository.createThread(payload)
      createOpen.value = false
      await Promise.all([catalogState.refresh(), threadListState.refresh(), myThreadState.refresh()])

      if (result.thread) {
        await router.push({
          path: "/forum",
          query: {
            tab: "browse",
            fid: String(result.thread.forumId),
            tid: String(result.thread.id),
          },
        })
      }

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: t("pages.forumPage.modalStatusSuccessTitle"),
        description: t("pages.forumPage.modalStatusSuccessDescription"),
      })
    }
    catch (err) {
      showMutationError(err, "pages.forumPage.modalStatusErrorTitle", "pages.forumPage.modalStatusErrorDescription")
    }
    finally {
      creating.value = false
    }
  }

  async function replyThread(message: string) {
    const thread = selectedThread.value
    if (!thread || replying.value) return

    replying.value = true
    try {
      const payload: ForumReplyPayload = {
        threadId: thread.id,
        forumId: thread.forumId || activeForumId.value,
        subject: thread.title,
        message,
      }
      await repository.replyThread(payload)
      await Promise.all([detailState.refresh(), threadListState.refresh(), myThreadState.refresh(), myMessageState.refresh()])

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: t("pages.forumPage.replyStatusSuccessTitle"),
        description: t("pages.forumPage.replyStatusSuccessDescription"),
      })
    }
    catch (err) {
      showMutationError(err, "pages.forumPage.replyStatusErrorTitle", "pages.forumPage.replyStatusErrorDescription")
    }
    finally {
      replying.value = false
    }
  }

  async function updateThread(payload: ForumThreadUpdatePayload) {
    if (saving.value) return false

    saving.value = true
    try {
      await repository.updateThread(payload)
      await Promise.all([threadListState.refresh(), myThreadState.refresh(), detailState.refresh(), forumSearchState.refresh()])
      showMutationSuccess("pages.forumPage.updateSuccessTitle", "pages.forumPage.updateThreadSuccessDescription")
      return true
    }
    catch (err) {
      showMutationError(err, "pages.forumPage.updateErrorTitle", "pages.forumPage.updateErrorDescription")
      return false
    }
    finally {
      saving.value = false
    }
  }

  async function updateReply(payload: ForumReplyUpdatePayload) {
    if (saving.value) return false

    saving.value = true
    try {
      await repository.updateReply(payload)
      await Promise.all([myMessageState.refresh(), detailState.refresh()])
      showMutationSuccess("pages.forumPage.updateSuccessTitle", "pages.forumPage.updateReplySuccessDescription")
      return true
    }
    catch (err) {
      showMutationError(err, "pages.forumPage.updateErrorTitle", "pages.forumPage.updateErrorDescription")
      return false
    }
    finally {
      saving.value = false
    }
  }

  async function deleteThread(id: number) {
    if (deleting.value) return false

    deleting.value = true
    try {
      await repository.deleteThread(id)
      await Promise.all([catalogState.refresh(), threadListState.refresh(), myThreadState.refresh(), forumSearchState.refresh()])
      await clearDeletedThreadFromRoute(id)
      showMutationSuccess("pages.forumPage.deleteSuccessTitle", "pages.forumPage.deleteThreadSuccessDescription")
      return true
    }
    catch (err) {
      showMutationError(err, "pages.forumPage.deleteErrorTitle", "pages.forumPage.deleteErrorDescription")
      return false
    }
    finally {
      deleting.value = false
    }
  }

  async function deleteReply(id: number) {
    if (deleting.value) return false

    deleting.value = true
    try {
      await repository.deleteReply(id)
      await Promise.all([myMessageState.refresh(), detailState.refresh(), threadListState.refresh(), myThreadState.refresh()])
      showMutationSuccess("pages.forumPage.deleteSuccessTitle", "pages.forumPage.deleteReplySuccessDescription")
      return true
    }
    catch (err) {
      showMutationError(err, "pages.forumPage.deleteErrorTitle", "pages.forumPage.deleteErrorDescription")
      return false
    }
    finally {
      deleting.value = false
    }
  }

  const loadMoreThreads = async () => {
    const current = activeTab.value === "my_threads" ? myThreadState.data.value : threadListState.data.value
    if (!current?.nextOffset || loadingMore.value) return
    if (activeTab.value !== "my_threads" && !activeForumId.value) return

    loadingMore.value = true
    try {
      if (activeTab.value === "my_threads") {
        const next = await repository.getMyThreads({
          q: readQueryValue(route.query.q),
          offset: current.nextOffset,
        })
        myThreadState.data.value = {
          ...next,
          threads: [...current.threads, ...next.threads],
        }
      }
      else {
        const next = await repository.getThreads({
          forumId: activeForumId.value,
          q: readQueryValue(route.query.q),
          offset: current.nextOffset,
        })
        threadListState.data.value = {
          ...next,
          threads: [...current.threads, ...next.threads],
        }
      }
    }
    finally {
      loadingMore.value = false
    }
  }

  const loadMoreMembers = async () => {
    const current = memberState.data.value
    if (!current?.nextOffset || loadingMore.value) return

    loadingMore.value = true
    try {
      const next = await repository.getMembers({
        q: readQueryValue(route.query.member),
        letter: memberLetter.value,
        offset: current.nextOffset,
      })
      memberState.data.value = {
        ...next,
        members: [...current.members, ...next.members],
      }
    }
    finally {
      loadingMore.value = false
    }
  }

  const loadMoreMessages = async () => {
    const current = myMessageState.data.value
    if (!current?.nextOffset || loadingMore.value) return

    loadingMore.value = true
    try {
      const next = await repository.getMyMessages({ offset: current.nextOffset })
      myMessageState.data.value = {
        ...next,
        messages: [...current.messages, ...next.messages],
      }
    }
    finally {
      loadingMore.value = false
    }
  }

  const loadMoreSearchResults = async () => {
    const current = forumSearchState.data.value
    if (!current?.nextOffset || loadingMore.value || !shouldSearch.value) return

    loadingMore.value = true
    try {
      const next = await repository.search({
        q: readQueryValue(route.query.q),
        scope: routeSearchScope.value,
        includeContent: routeSearchContent.value,
        sectionId: routeSearchSectionId.value,
        offset: current.nextOffset,
      })
      forumSearchState.data.value = {
        ...next,
        sections: [...current.sections, ...next.sections],
        threads: [...current.threads, ...next.threads],
      }
    }
    finally {
      loadingMore.value = false
    }
  }

  async function clearDeletedThreadFromRoute(id: number) {
    if (activeThreadId.value !== id) return

    const query = { ...route.query }
    delete query.tid
    await router.replace({ path: "/forum", query })
  }

  function showMutationSuccess(titleKey: string, descriptionKey: string) {
    toast.add({
      color: "success",
      icon: "i-ph-check-circle-fill",
      title: t(titleKey),
      description: t(descriptionKey),
    })
  }

  function showMutationError(errorValue: unknown, titleKey: string, descriptionKey: string) {
    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t(titleKey),
      description: errorValue instanceof Error ? errorValue.message : t(descriptionKey),
    })
  }

  return {
    activeTab,
    activeForumId,
    activeThreadId,
    memberLetter,
    browseSearch,
    memberSearch,
    advancedSearchTerm,
    advancedSearchScope,
    advancedSearchContent,
    advancedSearchSectionId,
    createOpen,
    creating,
    replying,
    saving,
    deleting,
    loadingMore,
    sections,
    forums,
    activeForum,
    forumThreads,
    myThreads,
    members,
    searchSections,
    searchThreads,
    searchResultType,
    myMessages,
    threads,
    selectedThread,
    canCreate,
    hasMoreThreads,
    hasMoreMembers,
    hasMoreMessages,
    hasMoreSearchResults,
    pending,
    tabPending,
    error,
    totalForumCount,
    totalThreadCount,
    isForumDrilldown,
    isThreadDetail,
    shouldSearch,
    selectTab,
    syncBrowseQuery,
    syncMemberQuery,
    selectMemberLetter,
    submitAdvancedSearch,
    selectForum,
    selectThread,
    resetFilters,
    openCreate,
    closeCreate,
    createThread,
    replyThread,
    updateThread,
    updateReply,
    deleteThread,
    deleteReply,
    loadMoreThreads,
    loadMoreMembers,
    loadMoreMessages,
    loadMoreSearchResults,
  }
}
