// English description: Loads the pages directory screen state, keeps search query in sync, and derives tab counts for page listing routes.

import { useStorage, watchDebounced } from "@vueuse/core"
import { computed, toValue, type MaybeRefOrGetter } from "vue"
import {
  communityPageRouteMap,
  communityPageTabs,
} from "../../domain/constants/community-options"
import { appendCommunityQuery } from "../../domain/services/community-helpers.service"
import type { CommunityPageTab } from "../../domain/types/community.types"
import type { CommunityPageRecord } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return String(value[0] || "")
  }

  return typeof value === "string" ? value : ""
}

export function useCommunityPagesDirectoryVM(
  modeSource: MaybeRefOrGetter<CommunityPageTab>,
  repository = createApiCommunityRepository(),
) {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const toast = useToast()
  const mode = computed(() => toValue(modeSource))
  const likedState = useState<Record<string, boolean>>(
    "community:pages:liked-state",
    () => ({}),
  )

  const search = ref(readQueryValue(route.query.q))
  const storedSearch = useStorage<string>(
    computed(() => `community:pages:${mode.value}:search`).value,
    "",
    undefined,
    { initOnMounted: true },
  )

  const { data: pagesData, status } = useAsyncData(
    () => `community:pages:${mode.value}`,
    () => repository.getPages(mode.value),
    {
      watch: [mode],
      default: () => [],
    },
  )

  const { data: countsData } = useAsyncData(
    "community:pages:counts",
    async () => {
      const [mine, suggested, favorite] = await Promise.all([
        repository.getPages("mine"),
        repository.getPages("suggested"),
        repository.getPages("favorite"),
      ])

      return {
        mine: mine.length,
        suggested: suggested.length,
        favorite: favorite.length,
      }
    },
    {
      default: () => ({
        mine: 0,
        suggested: 0,
        favorite: 0,
      }),
    },
  )

  const pending = computed(() => status.value === "pending")
  const pages = computed(() =>
    (pagesData.value ?? [])
      .map(page => ({
        ...page,
        liked: Object.prototype.hasOwnProperty.call(likedState.value, page.slug)
          ? likedState.value[page.slug]
          : Boolean(page.liked),
      }))
      .filter(page => mode.value !== "favorite" || page.liked),
  )

  const visiblePages = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    if (!keyword) {
      return pages.value
    }

    return pages.value.filter((page) => {
      const searchable = [
        page.name,
        page.slug,
        page.summary,
        page.ownerLabel,
        page.responseLabel,
        page.locationLabel || "",
        ...page.tags,
      ].join(" ").toLowerCase()

      return searchable.includes(keyword)
    })
  })

  const tabItems = computed(() =>
    communityPageTabs.map(tab => ({
      ...tab,
      to: appendCommunityQuery(communityPageRouteMap[tab.value], { q: search.value.trim() }),
      count: countsData.value?.[tab.value] ?? 0,
    })),
  )

  const actionLabel = computed(() => {
    if (mode.value === "suggested") {
      return t("community.pagesDirectory.actionSuggested")
    }

    if (mode.value === "favorite") {
      return t("community.pagesDirectory.actionFavorite")
    }

    return t("community.pagesDirectory.actionMine")
  })

  const filterStatusLabel = computed(() =>
    search.value.trim()
      ? t("community.pagesDirectory.resultsActive", { count: visiblePages.value.length })
      : t("community.pagesDirectory.resultsIdle"),
  )

  function handlePageLikedChange(updatedPage: CommunityPageRecord) {
    likedState.value = {
      ...likedState.value,
      [updatedPage.slug]: Boolean(updatedPage.liked),
    }

    const currentPages = pagesData.value ?? []
    const pageIndex = currentPages.findIndex(page => page.id === updatedPage.id)

    if (pageIndex >= 0) {
      currentPages[pageIndex] = {
        ...currentPages[pageIndex],
        ...updatedPage,
        liked: Boolean(updatedPage.liked),
      }
      pagesData.value = [...currentPages]
    }

    const liked = Boolean(updatedPage.liked)
    const shouldNotifyLiked = mode.value === "suggested" && liked
    const shouldNotifyUnliked = mode.value === "favorite" && !liked

    if (shouldNotifyLiked || shouldNotifyUnliked) {
      toast.add({
        color: liked ? "success" : "neutral",
        icon: liked ? "i-ph-thumbs-up-fill" : "i-ph-thumbs-down-duotone",
        title: t(liked
          ? "community.pagesDirectory.likedSuccessTitle"
          : "community.pagesDirectory.unlikedSuccessTitle"),
        description: t(liked
          ? "community.pagesDirectory.likedSuccessDescription"
          : "community.pagesDirectory.unlikedSuccessDescription", {
          page: updatedPage.name,
        }),
      })
    }

    void refreshNuxtData([
      "community:pages:suggested",
      "community:pages:favorite",
      "community:pages:counts",
    ])
  }

  watch(
    () => route.query.q,
    (value) => {
      const nextValue = readQueryValue(value)

      if (nextValue !== search.value) {
        search.value = nextValue
      }

      if (nextValue.trim()) {
        storedSearch.value = nextValue.trim()
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    if (!readQueryValue(route.query.q) && storedSearch.value.trim()) {
      search.value = storedSearch.value.trim()
    }
  })

  watchDebounced(
    search,
    async (value) => {
      const keyword = value.trim()
      storedSearch.value = keyword

      if (keyword === readQueryValue(route.query.q)) {
        return
      }

      const nextQuery = { ...route.query }

      if (keyword) {
        nextQuery.q = keyword
      }
      else {
        delete nextQuery.q
      }

      await router.replace({ query: nextQuery })
    },
    {
      debounce: 250,
      maxWait: 1000,
    },
  )

  return {
    mode,
    search,
    pending,
    visiblePages,
    tabItems,
    actionLabel,
    filterStatusLabel,
    handlePageLikedChange,
  }
}
