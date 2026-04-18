<template>
  <div class="space-y-5 pb-10">
    <GamesHero
      v-model:active-tab="activeTab"
      :stats="heroStats"
      :tabs="tabs"
    />

    <GamesFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section class="space-y-4">
        <div class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">Kết quả</p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ resultHeading }}</h2>
              <p class="mt-1 text-body-secondary">{{ filteredGames.length }} game phù hợp</p>
            </div>
            <button
              class="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-5 text-[13px] font-extrabold text-[var(--color-primary-600)]"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="h-4 w-4" />
              Đặt lại
            </button>
          </div>
        </div>

        <div v-if="filteredGames.length > 0" class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <GamesGameCard
            v-for="game in filteredGames"
            :key="game.id"
            :best-score="bestScoreById[game.id] ?? game.bestScore"
            :game="game"
            :saved="savedById[game.id] ?? game.isMine"
            :selected="selectedGame.id === game.id"
            @play="openGame"
            @select="selectGame"
            @toggle-save="toggleSave"
          />
        </div>

        <div v-else class="rounded-[30px] border border-dashed border-[var(--border-default)] bg-white p-8 text-center shadow-[var(--shadow-md)]">
          <Icon name="i-ph-game-controller-fill" class="mx-auto h-12 w-12 text-[var(--color-primary-600)]" />
          <h3 class="mt-3 text-xl font-black text-[var(--text-primary)]">Không tìm thấy game</h3>
          <p class="mt-2 text-body-secondary">Thử đổi tab, danh mục hoặc từ khóa tìm kiếm.</p>
        </div>
      </section>

      <GamesSidebar
        :achievements="achievements"
        :game-title="selectedGame.title"
        :leaderboard="selectedLeaderboard"
      />
    </div>

    <GamesGamePlayModal
      :best-score="activeGame ? (bestScoreById[activeGame.id] ?? activeGame.bestScore) : 0"
      :game="activeGame"
      @close="activeGame = undefined"
      @finish="recordSession"
    />
  </div>
</template>

<script setup lang="ts">
import type { GameCategoryKey, GameSessionPayload, GameTabKey, MockGame } from "~/composables/useMockGamesData"
import { formatGameNumber } from "~/composables/useMockGamesData"

const { tabs, categories, games, achievements } = useMockGamesData()

useSeoMeta({
  title: "Games | VNSEEA",
  description: "Danh sách game, tab game của tôi, game mới, game phổ biến và play game mock trong VNSEEA.",
})

const activeTab = ref<GameTabKey>("my")
const selectedCategory = ref<GameCategoryKey>("all")
const search = ref("")
const activeGame = ref<MockGame>()
const selectedGameId = ref(games[0]?.id ?? "")
const sessions = ref<GameSessionPayload[]>([])
const savedById = ref<Record<string, boolean>>(Object.fromEntries(games.map(game => [game.id, game.isMine])))
const bestScoreById = ref<Record<string, number>>({})

const filteredGames = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return games.filter((game) => {
    const matchesTab = activeTab.value === "my"
      ? (savedById.value[game.id] ?? game.isMine)
      : activeTab.value === "new"
        ? game.isNew
        : game.isPopular

    const matchesCategory = selectedCategory.value === "all" || game.category === selectedCategory.value
    const matchesKeyword = keyword.length === 0 || [
      game.title,
      game.categoryLabel,
      game.description,
      ...game.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesTab && matchesCategory && matchesKeyword
  })
})

watch(filteredGames, (items) => {
  if (!items.some(game => game.id === selectedGameId.value)) {
    selectedGameId.value = items[0]?.id ?? games[0]!.id
  }
})

const selectedGame = computed<MockGame>(() => games.find(game => game.id === selectedGameId.value) ?? games[0]!)

const selectedLeaderboard = computed(() => {
  const base = selectedGame.value.leaderboard
  const sessionScore = bestScoreById.value[selectedGame.value.id]
  const merged = sessionScore
    ? [
        { name: "Bạn", score: sessionScore },
        ...base.filter(player => player.name !== "Bạn"),
      ]
    : base

  return merged.slice().sort((left, right) => right.score - left.score)
})

const heroStats = computed(() => [
  {
    label: "Game",
    value: games.length,
    description: "Danh sách game mock.",
  },
  {
    label: "Lượt chơi",
    value: formatGameNumber(games.reduce((sum, game) => sum + game.plays, 0)),
    description: "Tổng lượt chơi.",
  },
  {
    label: "Phiên của bạn",
    value: sessions.value.length,
    description: "Lượt chơi trong phiên này.",
  },
])

const resultHeading = computed(() => {
  if (activeTab.value === "new") return "Game mới"
  if (activeTab.value === "popular") return "Game phổ biến"
  return "Game của tôi"
})

const openGame = (game: MockGame) => {
  selectedGameId.value = game.id
  activeGame.value = game
}

const selectGame = (game: MockGame) => {
  selectedGameId.value = game.id
}

const toggleSave = (id: string) => {
  savedById.value = {
    ...savedById.value,
    [id]: !(savedById.value[id] ?? games.find(game => game.id === id)?.isMine ?? false),
  }
}

const recordSession = (payload: GameSessionPayload) => {
  sessions.value = [payload, ...sessions.value]
  bestScoreById.value = {
    ...bestScoreById.value,
    [payload.gameId]: Math.max(payload.score, bestScoreById.value[payload.gameId] ?? games.find(game => game.id === payload.gameId)?.bestScore ?? 0),
  }
}

const resetFilters = () => {
  activeTab.value = "my"
  selectedCategory.value = "all"
  search.value = ""
}
</script>
