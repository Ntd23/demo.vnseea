export type LiveStreamStatus = "live" | "scheduled" | "ended"

export type MockLiveHost = {
  name: string
  initials: string
  role: string
  gradient: string
}

export type MockLiveComment = {
  id: number
  author: string
  initials: string
  message: string
  time: string
  isHost?: boolean
}

export type MockLiveStream = {
  id: string
  title: string
  status: LiveStreamStatus
  category: string
  cover: string
  host: MockLiveHost
  viewers: number
  likes: number
  startedAt: string
  duration: string
  description: string
  tags: string[]
  comments: MockLiveComment[]
}

export type GoLivePayload = {
  title: string
  category: string
  privacy: "public" | "members" | "private"
  description: string
}

export const useMockLiveData = () => {
  const { t } = useI18n()

  const categories = [
    t("pages.livePage.categoryCommunity"),
    t("pages.livePage.categoryEvents"),
    t("pages.livePage.categoryEducation"),
    t("pages.livePage.categoryBusiness"),
    t("pages.livePage.categoryQna"),
  ]

  const streams: MockLiveStream[] = [
    {
      id: "community-demo-day",
      title: t("pages.livePage.stream1Title"),
      status: "live",
      category: t("pages.livePage.categoryEvents"),
      cover: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
      host: {
        name: "Justin",
        initials: "JT",
        role: t("pages.livePage.hostCommunity"),
        gradient: "linear-gradient(135deg,var(--color-primary-500),var(--color-info))",
      },
      viewers: 1284,
      likes: 432,
      startedAt: t("pages.livePage.stream1StartedAt"),
      duration: "24:18",
      description: t("pages.livePage.stream1Description"),
      tags: ["#demo", "#community", "#live"],
      comments: [
        { id: 1, author: "Hoangne", initials: "HN", message: t("pages.livePage.stream1Comment1"), time: t("pages.livePage.justNow") },
        { id: 2, author: "Justin", initials: "JT", message: t("pages.livePage.stream1Comment2"), time: t("pages.livePage.oneMinute"), isHost: true },
        { id: 3, author: "Dung1", initials: "D1", message: t("pages.livePage.stream1Comment3"), time: t("pages.livePage.twoMinutes") },
      ],
    },
    {
      id: "founder-office-hours",
      title: t("pages.livePage.stream2Title"),
      status: "live",
      category: t("pages.livePage.categoryBusiness"),
      cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
      host: {
        name: "Hoangne",
        initials: "HN",
        role: t("pages.livePage.hostStartupMentor"),
        gradient: "linear-gradient(135deg,var(--color-accent-500),var(--color-primary-600))",
      },
      viewers: 642,
      likes: 218,
      startedAt: t("pages.livePage.stream2StartedAt"),
      duration: "11:06",
      description: t("pages.livePage.stream2Description"),
      tags: ["#startup", "#founder", "#qa"],
      comments: [
        { id: 4, author: "Ngọc Tokyo", initials: "NT", message: t("pages.livePage.stream2Comment1"), time: t("pages.livePage.oneMinute") },
        { id: 5, author: "Nicolas", initials: "NC", message: t("pages.livePage.stream2Comment2"), time: t("pages.livePage.threeMinutes") },
      ],
    },
    {
      id: "green-workshop",
      title: t("pages.livePage.stream3Title"),
      status: "scheduled",
      category: t("pages.livePage.categoryEducation"),
      cover: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
      host: {
        name: "Learning Guild",
        initials: "LG",
        role: t("pages.livePage.hostEducationPartner"),
        gradient: "linear-gradient(135deg,var(--color-success),var(--color-primary-500))",
      },
      viewers: 0,
      likes: 96,
      startedAt: t("pages.livePage.stream3StartedAt"),
      duration: t("pages.livePage.stream3Duration"),
      description: t("pages.livePage.stream3Description"),
      tags: ["#education", "#green", "#funding"],
      comments: [],
    },
  ]

  return {
    categories,
    streams,
  }
}
