export type GameTabKey = "my" | "new" | "popular"
export type GameCategoryKey = "all" | "puzzle" | "arcade" | "strategy" | "quiz" | "sport"

export type GameTab = {
  label: string
  value: GameTabKey
  icon: string
}

export type GameCategory = {
  label: string
  value: GameCategoryKey
  icon: string
}

export type MockGame = {
  id: string
  title: string
  category: Exclude<GameCategoryKey, "all">
  categoryLabel: string
  cover: string
  description: string
  players: number
  rating: number
  plays: number
  bestScore: number
  isMine: boolean
  isNew: boolean
  isPopular: boolean
  tags: string[]
  leaderboard: { name: string; score: number }[]
}

export type GameSessionPayload = {
  gameId: string
  score: number
  duration: string
}

export const useMockGamesData = () => {
  const { t } = useI18n()
  const tabs = computed<GameTab[]>(() => [
    { label: t("community.games.tabs.my"), value: "my", icon: "i-ph-user-circle-check-fill" },
    { label: t("community.games.tabs.new"), value: "new", icon: "i-ph-sparkle-fill" },
    { label: t("community.games.tabs.popular"), value: "popular", icon: "i-ph-fire-fill" },
  ])

  const categories = computed<GameCategory[]>(() => [
    { label: t("community.games.categories.all"), value: "all", icon: "i-ph-squares-four-fill" },
    { label: t("community.games.categories.puzzle"), value: "puzzle", icon: "i-ph-puzzle-piece-fill" },
    { label: t("community.games.categories.arcade"), value: "arcade", icon: "i-ph-game-controller-fill" },
    { label: t("community.games.categories.strategy"), value: "strategy", icon: "i-ph-flag-fill" },
    { label: t("community.games.categories.quiz"), value: "quiz", icon: "i-ph-question-fill" },
    { label: t("community.games.categories.sport"), value: "sport", icon: "i-ph-soccer-ball-fill" },
  ])

  const games = computed<MockGame[]>(() => [
    {
      id: "market-maze",
      title: t("community.mock.games.market-maze.title"),
      category: "puzzle",
      categoryLabel: t("community.games.categories.puzzle"),
      cover: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.market-maze.desc"),
      players: 1284,
      rating: 4.8,
      plays: 18400,
      bestScore: 9200,
      isMine: true,
      isNew: false,
      isPopular: true,
      tags: [t("community.mock.games.tags.logic"), t("community.mock.games.tags.market"), t("community.mock.games.tags.fast")],
      leaderboard: [
        { name: "Justin", score: 9200 },
        { name: "Hoangne", score: 8840 },
        { name: "Dung1", score: 8320 },
        { name: "Nicolas", score: 7900 },
      ],
    },
    {
      id: "startup-sprint",
      title: t("community.mock.games.startup-sprint.title"),
      category: "arcade",
      categoryLabel: t("community.games.categories.arcade"),
      cover: "https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.startup-sprint.desc"),
      players: 842,
      rating: 4.6,
      plays: 12600,
      bestScore: 7400,
      isMine: true,
      isNew: true,
      isPopular: true,
      tags: [t("community.mock.games.tags.startup"), t("community.mock.games.tags.speed"), t("community.mock.games.tags.demo")],
      leaderboard: [
        { name: "Hoangne", score: 7400 },
        { name: "Justin", score: 7110 },
        { name: "Ngoc Tokyo", score: 6880 },
        { name: "Dung1", score: 6500 },
      ],
    },
    {
      id: "green-city-builder",
      title: t("community.mock.games.green-city-builder.title"),
      category: "strategy",
      categoryLabel: t("community.games.categories.strategy"),
      cover: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.green-city-builder.desc"),
      players: 536,
      rating: 4.7,
      plays: 9300,
      bestScore: 6800,
      isMine: true,
      isNew: true,
      isPopular: false,
      tags: [t("community.mock.games.tags.green"), t("community.mock.games.tags.strategy"), t("community.mock.games.tags.city")],
      leaderboard: [
        { name: "Learning Guild", score: 6800 },
        { name: "Justin", score: 6420 },
        { name: "Quynh Lan", score: 6210 },
        { name: "Hoangne", score: 5900 },
      ],
    },
    {
      id: "vnseea-quiz-night",
      title: t("community.mock.games.vnseea-quiz-night.title"),
      category: "quiz",
      categoryLabel: t("community.games.categories.quiz"),
      cover: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.vnseea-quiz-night.desc"),
      players: 2190,
      rating: 4.9,
      plays: 24100,
      bestScore: 9900,
      isMine: true,
      isNew: false,
      isPopular: true,
      tags: [t("community.mock.games.tags.quiz"), t("community.mock.games.tags.community"), t("community.mock.games.tags.knowledge")],
      leaderboard: [
        { name: "Justin", score: 9900 },
        { name: "Dung1", score: 9440 },
        { name: "Ngoc Tokyo", score: 9010 },
        { name: "Nicolas", score: 8730 },
      ],
    },
    {
      id: "event-runner",
      title: t("community.mock.games.event-runner.title"),
      category: "sport",
      categoryLabel: t("community.games.categories.sport"),
      cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.event-runner.desc"),
      players: 412,
      rating: 4.4,
      plays: 5200,
      bestScore: 6100,
      isMine: false,
      isNew: true,
      isPopular: false,
      tags: [t("community.mock.games.tags.event"), t("community.mock.games.tags.runner"), t("community.mock.games.tags.friends")],
      leaderboard: [
        { name: "Event Crew", score: 6100 },
        { name: "Justin", score: 5840 },
        { name: "Hoangne", score: 5520 },
        { name: "Dung1", score: 5200 },
      ],
    },
    {
      id: "code-quest",
      title: t("community.mock.games.code-quest.title"),
      category: "strategy",
      categoryLabel: t("community.games.categories.strategy"),
      cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.code-quest.desc"),
      players: 730,
      rating: 4.7,
      plays: 11700,
      bestScore: 8600,
      isMine: true,
      isNew: true,
      isPopular: true,
      tags: [t("community.mock.games.tags.code"), t("community.mock.games.tags.strategy"), t("community.mock.games.tags.logic")],
      leaderboard: [
        { name: "Justin", score: 8600 },
        { name: "Ngoc Tokyo", score: 8210 },
        { name: "Hoangne", score: 7940 },
        { name: "Dung1", score: 7600 },
      ],
    },
    {
      id: "supply-chain-rush",
      title: t("community.mock.games.supply-chain-rush.title"),
      category: "arcade",
      categoryLabel: t("community.games.categories.arcade"),
      cover: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.supply-chain-rush.desc"),
      players: 1190,
      rating: 4.5,
      plays: 15100,
      bestScore: 8150,
      isMine: false,
      isNew: true,
      isPopular: true,
      tags: [t("community.mock.games.tags.logistics"), t("community.mock.games.tags.rush"), t("community.mock.games.tags.arcade")],
      leaderboard: [
        { name: "Hoangne", score: 8150 },
        { name: "Justin", score: 7880 },
        { name: "Nicolas", score: 7410 },
        { name: "Dung1", score: 7030 },
      ],
    },
    {
      id: "memory-lab",
      title: t("community.mock.games.memory-lab.title"),
      category: "puzzle",
      categoryLabel: t("community.games.categories.puzzle"),
      cover: "https://images.unsplash.com/photo-1607706189992-eae578626c86?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.memory-lab.desc"),
      players: 604,
      rating: 4.6,
      plays: 8800,
      bestScore: 7700,
      isMine: false,
      isNew: true,
      isPopular: false,
      tags: [t("community.mock.games.tags.memory"), t("community.mock.games.tags.puzzle"), t("community.mock.games.tags.combo")],
      leaderboard: [
        { name: "Ngoc Tokyo", score: 7700 },
        { name: "Justin", score: 7420 },
        { name: "Quynh Lan", score: 7100 },
        { name: "Dung1", score: 6890 },
      ],
    },
    {
      id: "penalty-master",
      title: t("community.mock.games.penalty-master.title"),
      category: "sport",
      categoryLabel: t("community.games.categories.sport"),
      cover: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
      description: t("community.mock.games.penalty-master.desc"),
      players: 1560,
      rating: 4.4,
      plays: 17600,
      bestScore: 8300,
      isMine: false,
      isNew: false,
      isPopular: true,
      tags: [t("community.mock.games.tags.football"), t("community.mock.games.tags.sport"), t("community.mock.games.tags.score")],
      leaderboard: [
        { name: "Nicolas", score: 8300 },
        { name: "Hoangne", score: 8020 },
        { name: "Justin", score: 7900 },
        { name: "Dung1", score: 7550 },
      ],
    },
  ])

  const achievements = computed(() => [
    { title: t("community.mock.games.achievements.firstPlay.title"), description: t("community.mock.games.achievements.firstPlay.desc"), progress: 100 },
    { title: t("community.mock.games.achievements.top10.title"), description: t("community.mock.games.achievements.top10.desc"), progress: 68 },
    { title: t("community.mock.games.achievements.streak.title"), description: t("community.mock.games.achievements.streak.desc"), progress: 40 },
  ])

  return {
    tabs,
    categories,
    games,
    achievements,
  }
}

export const formatGameNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN", { notation: value >= 10000 ? "compact" : "standard" }).format(value)
