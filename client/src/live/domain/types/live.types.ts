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
