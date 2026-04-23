<template>
  <div class="space-y-5 pb-10">
    <GamesHero
      v-model:active-tab="activeTab"
      :stats="heroStats"
      :tabs="tabs"
      :search-term="search || undefined"
      :active-category-label="selectedCategory !== 'all' ? activeCategoryLabel : undefined"
      :selected-game-title="gameSelectionPinned ? currentGameTitle : undefined"
      :has-active-filters="hasRouteState"
      @reset="resetFilters"
    />

    <GamesFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :result-count="filteredGames.length"
      :status-label="filtersStatusLabel"
      :has-active-filters="hasRouteState"
      @reset="resetFilters"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section class="space-y-4">
        <UCard class="rounded-[28px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]" :ui="{ body: 'p-5' }">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {{ t("pages.gamesPage.results") }}
              </p>
              <h2 class="mt-1 text-2xl font-extrabold text-[var(--color-text)]">
                {{ resultHeading }}
              </h2>
              <p class="mt-1 text-sm font-semibold text-[var(--color-muted)]">
                {{ t("pages.gamesPage.resultsMeta", { count: filteredGames.length }) }}
              </p>
            </div>

            <UButton
              v-if="hasRouteState"
              type="button"
              color="neutral"
              variant="outline"
              class="justify-center rounded-full"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="mr-1.5 h-4 w-4" />
              {{ t("pages.gamesPage.resetFilters") }}
            </UButton>
          </div>
        </UCard>

        <div v-if="filteredGames.length > 0" class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <GamesGameCard
            v-for="game in filteredGames"
            :key="game.id"
            :best-score="resolveBestScore(game)"
            :game="game"
            :saved="savedById[game.id] ?? game.isMine"
            :selected="currentGame?.id === game.id"
            @play="openGame"
            @select="selectGame"
            @toggle-save="toggleSave"
          />
        </div>

        <FoundationEmptyState
          v-else
          icon="i-ph-game-controller-fill"
          :title="t('pages.gamesPage.emptyTitle')"
          :description="t('pages.gamesPage.emptyDescription')"
          :primary-label="t('pages.gamesPage.resetFilters')"
          @primary="resetFilters"
        />
      </section>

      <GamesSidebar
        :achievements="achievements"
        :game-title="currentGameTitle"
        :game-description="currentGameDescription"
        :leaderboard="selectedLeaderboard"
        :stats="sidebarStats"
        :status-label="filtersStatusLabel"
        :has-active-filters="hasRouteState"
        @reset="resetFilters"
      />
    </div>

    <GamesGamePlayModal
      :best-score="activeGame ? resolveBestScore(activeGame) : 0"
      :game="activeGame"
      @close="activeGame = null"
      @finish="recordSession"
    />
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core"
import type { LocationQueryRaw } from "vue-router"
import type { GameCategoryKey, GameSessionPayload, GameTabKey, MockGame } from "~/composables/useMockGamesData"
import {
  defaultGameTab,
  filterMockGames,
  formatGameNumber,
  normalizeGameCategory,
  normalizeGameTab,
  readGameQueryValue,
  useMockGamesData,
} from "~/composables/useMockGamesData"

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { tabs, categories, games, achievements } = useMockGamesData()

const search = ref(readGameQueryValue(route.query.q).trim())
const activeTab = ref<GameTabKey>(normalizeGameTab(readGameQueryValue(route.query.tab)))
const selectedCategory = ref<GameCategoryKey>(normalizeGameCategory(readGameQueryValue(route.query.category)))
const selectedGameId = ref(readGameQueryValue(route.query.game).trim())
const gameSelectionPinned = ref(readGameQueryValue(route.query.game).trim().length > 0)
const activeGame = ref<MockGame | null>(null)
const sessions = ref<GameSessionPayload[]>([])
const savedById = ref<Record<string, boolean>>(
  Object.fromEntries(games.map(game => [game.id, game.isMine])),
)
const bestScoreById = ref<Record<string, number>>({})

const activeTabLabel = computed(() =>
  tabs.find(tab => tab.value === activeTab.value)?.label
  ?? t("pages.gamesPage.tabPopular"),
)

const activeCategoryLabel = computed(() =>
  categories.find(category => category.value === selectedCategory.value)?.label
  ?? t("pages.gamesPage.categoryAll"),
)

const filteredGames = computed(() =>
  filterMockGames(games, {
    search: search.value,
    category: selectedCategory.value,
    tab: activeTab.value,
    savedById: savedById.value,
  }),
)

const currentGame = computed<MockGame | null>(() =>
  filteredGames.value.find(game => game.id === selectedGameId.value)
  ?? filteredGames.value[0]
  ?? games[0]
  ?? null,
)

const currentGameTitle = computed(() =>
  currentGame.value?.title ?? t("pages.gamesPage.headingDefault"),
)

const currentGameDescription = computed(() =>
  currentGame.value?.description ?? t("pages.gamesPage.emptyDescription"),
)

const hasActiveFilters = computed(() =>
  search.value.trim().length > 0
  || selectedCategory.value !== "all"
  || activeTab.value !== defaultGameTab,
)

const hasRouteState = computed(() =>
  hasActiveFilters.value || gameSelectionPinned.value,
)

const selectedLeaderboard = computed(() => {
  if (!currentGame.value) return []

  const base = currentGame.value.leaderboard
  const sessionScore = bestScoreById.value[currentGame.value.id]
  const merged = sessionScore
    ? [
        { name: t("pages.gamesPage.leaderboardYou"), score: sessionScore },
        ...base.filter(player => player.name !== t("pages.gamesPage.leaderboardYou")),
      ]
    : base

  return merged.slice().sort((left, right) => right.score - left.score)
})

const heroStats = computed(() => [
  {
    label: t("pages.gamesPage.statVisible"),
    value: filteredGames.value.length,
    description: t("pages.gamesPage.statVisibleDescription"),
  },
  {
    label: t("pages.gamesPage.statPlays"),
    value: formatGameNumber(
      filteredGames.value.reduce((sum, game) => sum + game.plays, 0),
      locale.value,
    ),
    description: t("pages.gamesPage.statPlaysDescription"),
  },
  {
    label: t("pages.gamesPage.statSessions"),
    value: sessions.value.length,
    description: t("pages.gamesPage.statSessionsDescription"),
  },
])

const sidebarStats = computed(() => {
  const game = currentGame.value

  return [
    {
      label: t("pages.gamesPage.sidebarBestScore"),
      value: formatGameNumber(resolveBestScore(game), locale.value),
    },
    {
      label: t("pages.gamesPage.sidebarPlayers"),
      value: formatGameNumber(game?.players ?? 0, locale.value),
    },
    {
      label: t("pages.gamesPage.sidebarSessions"),
      value: sessions.value.filter(session => session.gameId === game?.id).length,
    },
  ]
})

const filtersStatusLabel = computed(() => {
  const count = filteredGames.value.length

  if (search.value && selectedCategory.value !== "all") {
    return t("pages.gamesPage.filterStatusSearchCategory", {
      count,
      query: search.value,
      category: activeCategoryLabel.value,
    })
  }

  if (search.value && activeTab.value !== defaultGameTab) {
    return t("pages.gamesPage.filterStatusSearchTab", {
      count,
      query: search.value,
      tab: activeTabLabel.value,
    })
  }

  if (search.value) {
    return t("pages.gamesPage.filterStatusSearch", {
      count,
      query: search.value,
    })
  }

  if (selectedCategory.value !== "all" && activeTab.value !== defaultGameTab) {
    return t("pages.gamesPage.filterStatusCategoryTab", {
      count,
      category: activeCategoryLabel.value,
      tab: activeTabLabel.value,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.gamesPage.filterStatusCategory", {
      count,
      category: activeCategoryLabel.value,
    })
  }

  if (activeTab.value !== defaultGameTab) {
    return t("pages.gamesPage.filterStatusTab", {
      count,
      tab: activeTabLabel.value,
    })
  }

  return t("pages.gamesPage.filterStatusDefault", {
    count,
  })
})

const resultHeading = computed(() => {
  if (search.value && selectedCategory.value !== "all") {
    return t("pages.gamesPage.headingSearchCategory", {
      query: search.value,
      category: activeCategoryLabel.value,
    })
  }

  if (search.value) {
    return t("pages.gamesPage.headingSearch", {
      query: search.value,
    })
  }

  if (selectedCategory.value !== "all") return activeCategoryLabel.value
  if (activeTab.value !== defaultGameTab) return activeTabLabel.value
  return t("pages.gamesPage.headingDefault")
})

watch(
  () => route.query.q,
  (value) => {
    const nextSearch = readGameQueryValue(value).trim()
    if (nextSearch !== search.value) {
      search.value = nextSearch
    }
  },
)

watch(
  () => route.query.tab,
  (value) => {
    const nextTab = normalizeGameTab(readGameQueryValue(value))
    if (nextTab !== activeTab.value) {
      activeTab.value = nextTab
    }
  },
)

watch(
  () => route.query.category,
  (value) => {
    const nextCategory = normalizeGameCategory(readGameQueryValue(value))
    if (nextCategory !== selectedCategory.value) {
      selectedCategory.value = nextCategory
    }
  },
)

watch(
  () => route.query.game,
  (value) => {
    const nextGameId = readGameQueryValue(value).trim()
    const fallbackGameId = filteredGames.value[0]?.id ?? games[0]?.id ?? ""
    const isValidGame = games.some(game => game.id === nextGameId)

    gameSelectionPinned.value = nextGameId.length > 0 && isValidGame

    if (nextGameId.length > 0 && isValidGame) {
      if (selectedGameId.value !== nextGameId) {
        selectedGameId.value = nextGameId
      }
      return
    }

    if (selectedGameId.value !== fallbackGameId) {
      selectedGameId.value = fallbackGameId
    }
  },
)

watch(
  filteredGames,
  (items) => {
    if (items.some(game => game.id === selectedGameId.value)) return

    selectedGameId.value = items[0]?.id ?? games[0]?.id ?? ""
    gameSelectionPinned.value = false
  },
  { immediate: true },
)

watchDebounced(
  search,
  () => {
    const normalizedSearch = search.value.trim()

    if (normalizedSearch !== search.value) {
      search.value = normalizedSearch
      return
    }

    syncRoute()
  },
  { debounce: 250, maxWait: 800 },
)

watch(activeTab, syncRoute)
watch(selectedCategory, syncRoute)
watch(selectedGameId, syncRoute)

onMounted(() => {
  syncRoute()
})

function resolveBestScore(game?: MockGame | null) {
  if (!game) return 0
  return bestScoreById.value[game.id] ?? game.bestScore
}

function openGame(game: MockGame) {
  selectGame(game)
  activeGame.value = game
}

function selectGame(game: MockGame) {
  selectedGameId.value = game.id
  gameSelectionPinned.value = true
}

function toggleSave(id: string) {
  const currentValue = savedById.value[id] ?? games.find(game => game.id === id)?.isMine ?? false
  const nextValue = !currentValue

  savedById.value = {
    ...savedById.value,
    [id]: nextValue,
  }

  toast.add({
    title: nextValue ? t("pages.gamesPage.saveToastTitle") : t("pages.gamesPage.unsaveToastTitle"),
    description: nextValue ? t("pages.gamesPage.saveToastDescription") : t("pages.gamesPage.unsaveToastDescription"),
    color: nextValue ? "primary" : "neutral",
    icon: nextValue ? "i-ph-bookmark-simple-fill" : "i-ph-bookmark-simple-bold",
  })
}

function recordSession(payload: GameSessionPayload) {
  sessions.value = [payload, ...sessions.value]
  bestScoreById.value = {
    ...bestScoreById.value,
    [payload.gameId]: Math.max(
      payload.score,
      bestScoreById.value[payload.gameId] ?? games.find(game => game.id === payload.gameId)?.bestScore ?? 0,
    ),
  }

  toast.add({
    title: t("pages.gamesPage.sessionToastTitle"),
    description: t("pages.gamesPage.sessionToastDescription", {
      score: formatGameNumber(payload.score, locale.value),
      duration: payload.duration,
    }),
    color: "success",
    icon: "i-ph-trophy-fill",
  })
}

function resetFilters() {
  search.value = ""
  activeTab.value = defaultGameTab
  selectedCategory.value = "all"
  gameSelectionPinned.value = false
  activeGame.value = null

  const defaultGameId = filterMockGames(games, {
    search: "",
    category: "all",
    tab: defaultGameTab,
    savedById: savedById.value,
  })[0]?.id ?? games[0]?.id ?? ""

  selectedGameId.value = defaultGameId
}

function syncRoute() {
  const nextSearch = search.value.trim()
  const currentRawSearch = readGameQueryValue(route.query.q)
  const currentRawTab = readGameQueryValue(route.query.tab)
  const currentRawCategory = readGameQueryValue(route.query.category)
  const currentRawGame = readGameQueryValue(route.query.game)
  const visibleSelectedGameId = filteredGames.value.some(game => game.id === selectedGameId.value)
    ? selectedGameId.value
    : ""

  if (gameSelectionPinned.value && !visibleSelectedGameId) {
    gameSelectionPinned.value = false
  }

  const nextTab = activeTab.value === defaultGameTab ? "" : activeTab.value
  const nextCategory = selectedCategory.value === "all" ? "" : selectedCategory.value
  const nextGame = gameSelectionPinned.value ? visibleSelectedGameId : ""

  if (
    currentRawSearch === nextSearch
    && currentRawTab === nextTab
    && currentRawCategory === nextCategory
    && currentRawGame === nextGame
  ) {
    return
  }

  const nextQuery: LocationQueryRaw = { ...route.query }

  if (nextSearch) {
    nextQuery.q = nextSearch
  }
  else {
    delete nextQuery.q
  }

  if (nextTab) {
    nextQuery.tab = nextTab
  }
  else {
    delete nextQuery.tab
  }

  if (nextCategory) {
    nextQuery.category = nextCategory
  }
  else {
    delete nextQuery.category
  }

  if (nextGame) {
    nextQuery.game = nextGame
  }
  else {
    delete nextQuery.game
  }

  void router.replace({ path: "/games", query: nextQuery })
}
</script>
