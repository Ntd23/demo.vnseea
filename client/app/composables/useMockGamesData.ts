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
  const tabs: GameTab[] = [
    { label: "Game của tôi", value: "my", icon: "i-ph-user-circle-check-fill" },
    { label: "Mới", value: "new", icon: "i-ph-sparkle-fill" },
    { label: "Phổ biến", value: "popular", icon: "i-ph-fire-fill" },
  ]

  const categories: GameCategory[] = [
    { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill" },
    { label: "Giải đố", value: "puzzle", icon: "i-ph-puzzle-piece-fill" },
    { label: "Arcade", value: "arcade", icon: "i-ph-game-controller-fill" },
    { label: "Chiến thuật", value: "strategy", icon: "i-ph-flag-fill" },
    { label: "Quiz", value: "quiz", icon: "i-ph-question-fill" },
    { label: "Thể thao", value: "sport", icon: "i-ph-soccer-ball-fill" },
  ]

  const games: MockGame[] = [
    {
      id: "market-maze",
      title: "Market Maze",
      category: "puzzle",
      categoryLabel: "Giải đố",
      cover: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1200&q=80",
      description: "Xếp đường đi cho đơn hàng qua các trạm thị trường trước khi hết thời gian.",
      players: 1284,
      rating: 4.8,
      plays: 18400,
      bestScore: 9200,
      isMine: true,
      isNew: false,
      isPopular: true,
      tags: ["#logic", "#market", "#fast"],
      leaderboard: [
        { name: "Justin", score: 9200 },
        { name: "Hoangne", score: 8840 },
        { name: "Dung1", score: 8320 },
        { name: "Nicolas", score: 7900 },
      ],
    },
    {
      id: "startup-sprint",
      title: "Startup Sprint",
      category: "arcade",
      categoryLabel: "Arcade",
      cover: "https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=80",
      description: "Thu thập ý tưởng, né blocker và tăng tốc trước demo day.",
      players: 842,
      rating: 4.6,
      plays: 12600,
      bestScore: 7400,
      isMine: true,
      isNew: true,
      isPopular: true,
      tags: ["#startup", "#speed", "#demo"],
      leaderboard: [
        { name: "Hoangne", score: 7400 },
        { name: "Justin", score: 7110 },
        { name: "Ngoc Tokyo", score: 6880 },
        { name: "Dung1", score: 6500 },
      ],
    },
    {
      id: "green-city-builder",
      title: "Green City Builder",
      category: "strategy",
      categoryLabel: "Chiến thuật",
      cover: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      description: "Cân bằng năng lượng, cây xanh và ngân sách để xây khu phố bền vững.",
      players: 536,
      rating: 4.7,
      plays: 9300,
      bestScore: 6800,
      isMine: true,
      isNew: true,
      isPopular: false,
      tags: ["#green", "#strategy", "#city"],
      leaderboard: [
        { name: "Learning Guild", score: 6800 },
        { name: "Justin", score: 6420 },
        { name: "Quynh Lan", score: 6210 },
        { name: "Hoangne", score: 5900 },
      ],
    },
    {
      id: "vnseea-quiz-night",
      title: "VNSEEA Quiz Night",
      category: "quiz",
      categoryLabel: "Quiz",
      cover: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80",
      description: "Trả lời nhanh các câu hỏi về cộng đồng, sự kiện và marketplace.",
      players: 2190,
      rating: 4.9,
      plays: 24100,
      bestScore: 9900,
      isMine: true,
      isNew: false,
      isPopular: true,
      tags: ["#quiz", "#community", "#knowledge"],
      leaderboard: [
        { name: "Justin", score: 9900 },
        { name: "Dung1", score: 9440 },
        { name: "Ngoc Tokyo", score: 9010 },
        { name: "Nicolas", score: 8730 },
      ],
    },
    {
      id: "event-runner",
      title: "Event Runner",
      category: "sport",
      categoryLabel: "Thể thao",
      cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      description: "Chạy qua các checkpoint sự kiện, mời bạn bè và hoàn thành nhiệm vụ.",
      players: 412,
      rating: 4.4,
      plays: 5200,
      bestScore: 6100,
      isMine: false,
      isNew: true,
      isPopular: false,
      tags: ["#event", "#runner", "#friends"],
      leaderboard: [
        { name: "Event Crew", score: 6100 },
        { name: "Justin", score: 5840 },
        { name: "Hoangne", score: 5520 },
        { name: "Dung1", score: 5200 },
      ],
    },
    {
      id: "code-quest",
      title: "Code Quest",
      category: "strategy",
      categoryLabel: "Chiến thuật",
      cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      description: "Sắp xếp module, tối ưu tài nguyên và vượt qua các bug trước deadline.",
      players: 730,
      rating: 4.7,
      plays: 11700,
      bestScore: 8600,
      isMine: true,
      isNew: true,
      isPopular: true,
      tags: ["#code", "#strategy", "#logic"],
      leaderboard: [
        { name: "Justin", score: 8600 },
        { name: "Ngoc Tokyo", score: 8210 },
        { name: "Hoangne", score: 7940 },
        { name: "Dung1", score: 7600 },
      ],
    },
    {
      id: "supply-chain-rush",
      title: "Supply Chain Rush",
      category: "arcade",
      categoryLabel: "Arcade",
      cover: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      description: "Điều phối kho, xe giao hàng và đơn khẩn trong một vòng chơi tốc độ.",
      players: 1190,
      rating: 4.5,
      plays: 15100,
      bestScore: 8150,
      isMine: false,
      isNew: true,
      isPopular: true,
      tags: ["#logistics", "#rush", "#arcade"],
      leaderboard: [
        { name: "Hoangne", score: 8150 },
        { name: "Justin", score: 7880 },
        { name: "Nicolas", score: 7410 },
        { name: "Dung1", score: 7030 },
      ],
    },
    {
      id: "memory-lab",
      title: "Memory Lab",
      category: "puzzle",
      categoryLabel: "Giải đố",
      cover: "https://images.unsplash.com/photo-1607706189992-eae578626c86?auto=format&fit=crop&w=1200&q=80",
      description: "Ghi nhớ chuỗi biểu tượng, mở khoá phòng thí nghiệm và tăng combo.",
      players: 604,
      rating: 4.6,
      plays: 8800,
      bestScore: 7700,
      isMine: false,
      isNew: true,
      isPopular: false,
      tags: ["#memory", "#puzzle", "#combo"],
      leaderboard: [
        { name: "Ngoc Tokyo", score: 7700 },
        { name: "Justin", score: 7420 },
        { name: "Quynh Lan", score: 7100 },
        { name: "Dung1", score: 6890 },
      ],
    },
    {
      id: "penalty-master",
      title: "Penalty Master",
      category: "sport",
      categoryLabel: "Thể thao",
      cover: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
      description: "Canh lực sút, hướng bóng và chuỗi penalty để leo top bảng xếp hạng.",
      players: 1560,
      rating: 4.4,
      plays: 17600,
      bestScore: 8300,
      isMine: false,
      isNew: false,
      isPopular: true,
      tags: ["#football", "#sport", "#score"],
      leaderboard: [
        { name: "Nicolas", score: 8300 },
        { name: "Hoangne", score: 8020 },
        { name: "Justin", score: 7900 },
        { name: "Dung1", score: 7550 },
      ],
    },
  ]

  const achievements = [
    { title: "First Play", description: "Hoàn thành lượt chơi đầu tiên.", progress: 100 },
    { title: "Top 10%", description: "Đạt điểm cao hơn 90% người chơi.", progress: 68 },
    { title: "Daily Streak", description: "Chơi 5 ngày liên tiếp.", progress: 40 },
  ]

  return {
    tabs,
    categories,
    games,
    achievements,
  }
}

export const formatGameNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN", { notation: value >= 10000 ? "compact" : "standard" }).format(value)
