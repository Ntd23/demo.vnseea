<template>
  <GamesRuntimePage />
</template>

<script setup lang="ts">
import GamesRuntimePage from "../../src/games/presentation/pages/GamesPage.vue"
import {
  defaultGameTab,
  filterMockGames,
  normalizeGameCategory,
  normalizeGameTab,
  readGameQueryValue,
  useMockGamesData,
} from "../../src/games/infrastructure/mocks/gamesCatalog"

definePageMeta({
  layout: "default",
})

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()
const { tabs, categories, games } = useMockGamesData()

const searchQuery = computed(() =>
  readGameQueryValue(route.query.q).trim(),
)

const activeTab = computed(() =>
  normalizeGameTab(readGameQueryValue(route.query.tab)),
)

const selectedCategory = computed(() =>
  normalizeGameCategory(readGameQueryValue(route.query.category)),
)

const selectedGameId = computed(() =>
  readGameQueryValue(route.query.game).trim(),
)

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
    search: searchQuery.value,
    category: selectedCategory.value,
    tab: activeTab.value,
  }),
)

const hasSelectedGame = computed(() =>
  filteredGames.value.some(game => game.id === selectedGameId.value),
)

const selectedGame = computed(() =>
  filteredGames.value.find(game => game.id === selectedGameId.value)
  ?? filteredGames.value[0]
  ?? games[0]
  ?? null,
)

const seoTitle = computed(() => {
  if (hasSelectedGame.value && selectedGame.value) {
    return t("pages.gamesPage.seoTitleGame", {
      title: selectedGame.value.title,
    })
  }

  if (searchQuery.value && selectedCategory.value !== "all") {
    return t("pages.gamesPage.seoTitleQueryCategory", {
      query: searchQuery.value,
      category: activeCategoryLabel.value,
    })
  }

  if (searchQuery.value && activeTab.value !== defaultGameTab) {
    return t("pages.gamesPage.seoTitleQueryTab", {
      query: searchQuery.value,
      tab: activeTabLabel.value,
    })
  }

  if (searchQuery.value) {
    return t("pages.gamesPage.seoTitleQuery", {
      query: searchQuery.value,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.gamesPage.seoTitleCategory", {
      category: activeCategoryLabel.value,
    })
  }

  if (activeTab.value !== defaultGameTab) {
    return t("pages.gamesPage.seoTitleTab", {
      tab: activeTabLabel.value,
    })
  }

  return t("pages.gamesPage.seoTitle")
})

const seoDescription = computed(() => {
  if (hasSelectedGame.value && selectedGame.value) {
    return t("pages.gamesPage.seoDescriptionGame", {
      title: selectedGame.value.title,
      description: selectedGame.value.description,
    })
  }

  if (searchQuery.value && selectedCategory.value !== "all") {
    return t("pages.gamesPage.seoDescriptionQueryCategory", {
      query: searchQuery.value,
      category: activeCategoryLabel.value,
      count: filteredGames.value.length,
    })
  }

  if (searchQuery.value && activeTab.value !== defaultGameTab) {
    return t("pages.gamesPage.seoDescriptionQueryTab", {
      query: searchQuery.value,
      tab: activeTabLabel.value,
      count: filteredGames.value.length,
    })
  }

  if (searchQuery.value) {
    return t("pages.gamesPage.seoDescriptionQuery", {
      query: searchQuery.value,
      count: filteredGames.value.length,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.gamesPage.seoDescriptionCategory", {
      category: activeCategoryLabel.value,
      count: filteredGames.value.length,
    })
  }

  if (activeTab.value !== defaultGameTab) {
    return t("pages.gamesPage.seoDescriptionTab", {
      tab: activeTabLabel.value,
      count: filteredGames.value.length,
    })
  }

  return t("pages.gamesPage.seoDescription")
})

const canonicalUrl = computed(() => {
  const url = new URL("/games", requestURL.origin)

  if (searchQuery.value) {
    url.searchParams.set("q", searchQuery.value)
  }

  if (activeTab.value !== defaultGameTab) {
    url.searchParams.set("tab", activeTab.value)
  }

  if (selectedCategory.value !== "all") {
    url.searchParams.set("category", selectedCategory.value)
  }

  if (hasSelectedGame.value) {
    url.searchParams.set("game", selectedGameId.value)
  }

  return url.toString()
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => selectedGame.value?.cover ?? filteredGames.value[0]?.cover ?? games[0]?.cover,
})

useHead({
  link: [
    {
      rel: "canonical",
      href: () => canonicalUrl.value,
    },
  ],
})
</script>
